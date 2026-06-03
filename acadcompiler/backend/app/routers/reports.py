"""Reports, history, share links, checklist, and grader PDF."""
from __future__ import annotations
import uuid, datetime
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from .upload import get_doc_entry

router = APIRouter()

_share_store: dict = {}  # token -> {doc_id, style, report, expires_at}


@router.get("/{doc_id}/history")
def get_history(doc_id: str):
    entry = get_doc_entry(doc_id)
    return {"doc_id": doc_id, "history": entry.get("compile_history", [])}


@router.post("/{doc_id}/share")
def create_share_link(doc_id: str, style: str = Query(...)):
    entry = get_doc_entry(doc_id)
    report = entry.get("last_report")
    if not report:
        raise HTTPException(404, f"No compiled report for doc {doc_id}. Compile first.")
    token = uuid.uuid4().hex
    expires = (datetime.datetime.utcnow() + datetime.timedelta(hours=48)).isoformat()
    _share_store[token] = {
        "doc_id": doc_id,
        "style": style,
        "report": report,
        "expires_at": expires,
        "filename": entry.get("filename", ""),
    }
    return {"share_url": f"/shared/{token}", "token": token, "expires_in_hours": 48}


@router.get("/shared/{token}")
def get_shared_report(token: str):
    record = _share_store.get(token)
    if not record:
        raise HTTPException(404, "Share link not found or expired.")
    expires = datetime.datetime.fromisoformat(record["expires_at"])
    if datetime.datetime.utcnow() > expires:
        del _share_store[token]
        raise HTTPException(410, "Share link has expired.")
    return record["report"]


@router.get("/{doc_id}/checklist")
def submission_checklist(doc_id: str, style: str = Query(...)):
    """Submission readiness checklist derived from last compile report."""
    entry = get_doc_entry(doc_id)
    report = entry.get("last_report")
    if not report:
        raise HTTPException(404, "No compile report found. Compile first.")

    items = []
    cat_scores = report.get("category_scores", {})
    diags = report.get("diagnostics", [])
    diag_ids = {d["rule_id"] for d in diags if d["source"] == "rule"}

    def _status(condition: bool, unknown: bool = False):
        if unknown:
            return "unknown"
        return "pass" if condition else "fail"

    items.append({"check": "page_size", "label": "Correct page size",
                  "status": _status(not any("PAGE.SIZE" in r for r in diag_ids))})
    items.append({"check": "margins", "label": "All margins correct",
                  "status": _status(not any("MARGIN" in r for r in diag_ids))})
    items.append({"check": "font", "label": "Correct font & size",
                  "status": _status(cat_scores.get("font", 0) >= 90)})
    items.append({"check": "spacing", "label": "Line spacing correct",
                  "status": _status(cat_scores.get("spacing", 0) >= 90)})
    items.append({"check": "references_complete", "label": "No undefined citations",
                  "status": _status(not any("CITE.UNDEFINED" in r for r in diag_ids))})
    items.append({"check": "no_unused_refs", "label": "No unused references",
                  "status": _status(not any("REF.UNUSED" in r for r in diag_ids))})
    items.append({"check": "required_sections", "label": "All required sections present",
                  "status": _status(len(report.get("missing_sections", [])) == 0)})
    items.append({"check": "blind_review", "label": "No author-identifying text",
                  "status": "unknown", "detail": "Run blind review check"})

    pass_count = sum(1 for i in items if i["status"] == "pass")
    fail_count = sum(1 for i in items if i["status"] == "fail")
    unknown_count = sum(1 for i in items if i["status"] == "unknown")

    return {
        "items": items,
        "ready": fail_count == 0 and unknown_count == 0,
        "pass_count": pass_count,
        "fail_count": fail_count,
        "unknown_count": unknown_count,
    }


@router.post("/{doc_id}/grader-pdf")
def export_grader_pdf(doc_id: str, style: str = Query(...)):
    """Export a grader-facing PDF with every rule, its status, evidence, and spec citation."""
    entry = get_doc_entry(doc_id)
    report = entry.get("last_report")
    if not report:
        raise HTTPException(404, "No compile report found. Compile first.")

    try:
        from fpdf import FPDF
    except ImportError:
        raise HTTPException(501, "PDF export requires fpdf2. Install with: pip install fpdf2")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "AcadCompiler — Grader Report", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"File: {entry.get('filename', doc_id)}", ln=True)
    pdf.cell(0, 6, f"Style: {report.get('style_id')} | Score: {report.get('score')}% ({report.get('score_band')})", ln=True)
    pdf.cell(0, 6, f"Engine: v{report.get('engine_version')} | Ruleset v{report.get('ruleset_version')}", ln=True)
    pdf.ln(4)

    # Table header
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(35, 7, "Rule ID", border=1, fill=True)
    pdf.cell(15, 7, "Sev.", border=1, fill=True)
    pdf.cell(15, 7, "Cat.", border=1, fill=True)
    pdf.cell(125, 7, "Message", border=1, fill=True, ln=True)

    pdf.set_font("Helvetica", "", 8)
    for d in report.get("diagnostics", []):
        if d.get("source") != "rule":
            continue
        sev = d.get("severity", "")
        if sev == "error":
            pdf.set_text_color(180, 0, 0)
        elif sev == "warning":
            pdf.set_text_color(180, 100, 0)
        else:
            pdf.set_text_color(0, 0, 180)
        pdf.cell(35, 6, (d.get("rule_id") or "")[:20], border=1)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(15, 6, sev[:4], border=1)
        pdf.cell(15, 6, (d.get("category") or "")[:6], border=1)
        msg = (d.get("message") or "")[:65]
        pdf.cell(125, 6, msg, border=1, ln=True)
        if d.get("evidence"):
            pdf.set_font("Helvetica", "I", 7)
            pdf.cell(10, 5, "")
            pdf.cell(180, 5, f"Evidence: {d['evidence'][:90]}", ln=True)
            pdf.set_font("Helvetica", "", 8)

    buf = pdf.output(dest="S")
    if isinstance(buf, str):
        buf = buf.encode("latin-1")

    return StreamingResponse(
        iter([buf]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="grader_{doc_id}.pdf"'},
    )
