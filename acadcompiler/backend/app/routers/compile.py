from __future__ import annotations
import datetime
from fastapi import APIRouter, HTTPException, Query, Body
from ...models import CompileReport, Diagnostic
from ...engine.registry_loader import run_all_rules
from ...engine.symbol_table import build_citation_audit
from ...engine.scoring import compute_score, weakest_dimension
from ...parsing.ir import build_ir_from_docx, build_ir_from_pdf
from ..config import settings
from .upload import get_doc, store_last_report, get_doc_entry
from .styles import get_style

router = APIRouter()

SEVERITY_WEIGHT = {"error": 1.0, "warning": 0.5, "info": 0.1}


def _compute_triage(diagnostics: list[Diagnostic], spec, current_score: float) -> list[dict]:
    """Top-5 highest-impact fixes to reach green."""
    rule_diags = [d for d in diagnostics if d.source == "rule" and d.severity in ("error", "warning")]
    weights = spec.weights
    items = []
    for d in rule_diags:
        cat_weight = weights.get(d.category, 0.1)
        sev_weight = SEVERITY_WEIGHT.get(d.severity, 0.5)
        impact = round(cat_weight * sev_weight * 20, 1)  # rough pts gained by fixing
        items.append({
            "rule_id": d.rule_id,
            "severity": d.severity,
            "category": d.category,
            "score_impact": impact,
            "message": d.message,
            "fix_hint": d.fix_hint,
        })
    items.sort(key=lambda x: x["score_impact"], reverse=True)
    projected = min(100.0, current_score + sum(x["score_impact"] for x in items[:3]))
    for item in items[:5]:
        item["projected_after"] = round(projected, 1)
    return items[:5]


def _run_compile(doc_id: str, style: str) -> CompileReport:
    data, ext = get_doc(doc_id)
    spec = get_style(style)

    try:
        ir = build_ir_from_docx(data) if ext == ".docx" else build_ir_from_pdf(data)
    except Exception as e:
        raise HTTPException(422, f"Parse error: {e}")

    diagnostics = run_all_rules(ir, spec)
    audit = build_citation_audit(ir, spec)
    diagnostics.extend(audit["diagnostics"])

    score, cat_scores, band = compute_score(diagnostics, spec)
    triage = _compute_triage(diagnostics, spec, score)

    missing = [s for s in spec.structure.get("required_ordered", [])
               if not any(s.lower().replace("_", " ") in b.text.lower()
                          for b in ir.blocks if b.kind in ("heading", "title", "abstract"))]
    forbidden = [s for s in spec.structure.get("forbidden", [])
                 if any(s.lower().replace("_", " ") in b.text.lower() for b in ir.blocks)]

    partial = any(d.rule_id.startswith("ENGINE.") for d in diagnostics) or bool(ir.parse_warnings)

    report = CompileReport(
        style_id=spec.id,
        ruleset_version=spec.version or "1.0",
        ruleset_last_verified=spec.last_verified or "unverified",
        engine_version=settings.engine_version,
        csl_version=settings.csl_version,
        model_version=None,
        score=score,
        category_scores=cat_scores,
        score_band=band,
        diagnostics=diagnostics,
        missing_sections=missing,
        forbidden_or_empty=forbidden,
        citation_audit={
            "undefined": audit["undefined"],
            "unused": audit["unused"],
            "weakest_dimension": weakest_dimension(cat_scores),
        },
        parse_warnings=ir.parse_warnings,
        partial=partial,
        triage=triage,
    )
    return report


@router.post("/{doc_id}")
def compile_document(doc_id: str, style: str = Query(...)) -> CompileReport:
    report = _run_compile(doc_id, style)
    entry = get_doc_entry(doc_id)
    report_dict = report.model_dump()
    report_dict["compiled_at"] = datetime.datetime.utcnow().isoformat()
    report_dict["filename"] = entry.get("filename", "")
    store_last_report(doc_id, report_dict)
    return report


@router.post("/{doc_id}/multi")
def multi_compile(doc_id: str, body: dict = Body(...)):
    styles = body.get("styles", [])
    if not styles:
        raise HTTPException(400, "Provide 'styles' list in body")
    results = {}
    for style in styles:
        try:
            r = _run_compile(doc_id, style)
            top3 = [d.message for d in r.diagnostics if d.source == "rule"][:3]
            results[style] = {"score": r.score, "band": r.score_band, "top_3_issues": top3}
        except HTTPException as e:
            results[style] = {"error": e.detail}
    return results
