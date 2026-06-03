from fastapi import APIRouter, HTTPException, Query
from ...models import CompileReport
from ...engine.registry_loader import run_all_rules
from ...engine.symbol_table import build_citation_audit
from ...engine.scoring import compute_score, weakest_dimension
from ...parsing.ir import build_ir_from_docx, build_ir_from_pdf
from ..config import settings
from .upload import get_doc
from .styles import get_style

router = APIRouter()


@router.post("/{doc_id}")
def compile_document(doc_id: str, style: str = Query(..., description="Style ID, e.g. apa7")) -> CompileReport:
    data, ext = get_doc(doc_id)
    spec = get_style(style)

    try:
        if ext == ".docx":
            ir = build_ir_from_docx(data)
        else:
            ir = build_ir_from_pdf(data)
    except Exception as e:
        raise HTTPException(422, f"Parse error: {e}")

    diagnostics = run_all_rules(ir, spec)

    audit = build_citation_audit(ir, spec)
    diagnostics.extend(audit["diagnostics"])

    score, cat_scores, band = compute_score(diagnostics, spec)

    missing = [s for s in spec.structure.get("required_ordered", [])
               if not any(s.lower().replace("_", " ") in b.text.lower() for b in ir.blocks
                          if b.kind in ("heading", "title", "abstract"))]
    forbidden = [s for s in spec.structure.get("forbidden", [])
                 if any(s.lower().replace("_", " ") in b.text.lower() for b in ir.blocks)]

    partial = any(d.rule_id.startswith("ENGINE.") for d in diagnostics) or bool(ir.parse_warnings)

    return CompileReport(
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
    )
