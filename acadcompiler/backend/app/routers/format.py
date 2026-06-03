"""Auto-fix router — applies deterministic formatting fixes to .docx files."""
from __future__ import annotations
import io
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from .upload import get_doc, get_doc_entry
from .styles import get_style

router = APIRouter()

EMU_PER_INCH = 914400
TWIPS_PER_INCH = 1440
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{WORD_NS}}}"


def _apply_fixes(data: bytes, spec) -> tuple[bytes, list[dict]]:
    """Apply margin, font, and spacing fixes to a .docx. Returns (fixed_bytes, changes)."""
    from docx import Document
    from docx.shared import Pt, Inches
    from lxml import etree

    changes = []
    doc = Document(io.BytesIO(data))

    # --- Margins via sectPr ---
    try:
        body = doc.element.body
        sect_pr = body.find(f"{W}sectPr")
        if sect_pr is None:
            sect_pr = etree.SubElement(body, f"{W}sectPr")

        expected_margins = spec.page.get("margins_in", {})
        pg_mar = sect_pr.find(f"{W}pgMar")
        if pg_mar is None:
            pg_mar = etree.SubElement(sect_pr, f"{W}pgMar")

        for side in ("top", "bottom", "left", "right"):
            exp = expected_margins.get(side)
            if exp is None:
                continue
            exp_twips = str(int(exp * TWIPS_PER_INCH))
            cur = pg_mar.get(f"{W}{side}")
            cur_in = int(cur) / TWIPS_PER_INCH if cur else None
            if cur_in is None or abs(cur_in - exp) > 0.02:
                pg_mar.set(f"{W}{side}", exp_twips)
                changes.append({"property": f"{side}_margin_in",
                                 "from": f"{cur_in:.2f}in" if cur_in else "unknown",
                                 "to": f"{exp:.2f}in"})
    except Exception as e:
        changes.append({"property": "margins", "from": "error", "to": str(e)})

    # --- Default font & size on Normal style ---
    try:
        exp_font = spec.font.get("family")
        exp_size = spec.font.get("size_pt")
        normal = doc.styles["Normal"]
        if exp_font and normal.font.name != exp_font:
            old_font = normal.font.name
            normal.font.name = exp_font
            changes.append({"property": "default_font", "from": str(old_font), "to": exp_font})
        if exp_size:
            old_size = normal.font.size.pt if normal.font.size else None
            if old_size is None or abs(old_size - exp_size) > 0.5:
                normal.font.size = Pt(exp_size)
                changes.append({"property": "default_size_pt",
                                 "from": f"{old_size}pt" if old_size else "unknown",
                                 "to": f"{exp_size}pt"})
    except Exception as e:
        changes.append({"property": "font", "from": "error", "to": str(e)})

    # --- Line spacing ---
    try:
        from docx.enum.text import WD_LINE_SPACING
        from docx.shared import Pt as SPt
        spacing_str = spec.spacing.get("line", "double")
        normal = doc.styles["Normal"]
        pf = normal.paragraph_format
        old_spacing = pf.line_spacing
        if spacing_str == "double":
            pf.line_spacing_rule = WD_LINE_SPACING.DOUBLE
            pf.line_spacing = None
            if str(old_spacing) != "2.0":
                changes.append({"property": "line_spacing", "from": str(old_spacing), "to": "double"})
        elif spacing_str == "single":
            pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
            pf.line_spacing = None
        elif spacing_str == "onehalf":
            pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
            pf.line_spacing = None
    except Exception as e:
        changes.append({"property": "spacing", "from": "error", "to": str(e)})

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue(), changes


@router.post("/{doc_id}")
def format_document(doc_id: str, style: str = Query(...)):
    data, ext = get_doc(doc_id)
    if ext != ".docx":
        raise HTTPException(400, "Auto-fix only supports .docx files. PDF cannot be programmatically fixed.")

    entry = get_doc_entry(doc_id)
    spec = get_style(style)

    fixed_data, changes = _apply_fixes(data, spec)
    filename = entry.get("filename", "document.docx")
    fixed_name = f"fixed_{filename}"

    def gen():
        yield fixed_data

    return StreamingResponse(
        gen(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{fixed_name}"',
            "X-Changes": str(len(changes)),
            "X-Changes-Summary": "; ".join(f"{c['property']}: {c['from']}→{c['to']}" for c in changes[:5]),
        }
    )


@router.get("/{doc_id}/diff")
def format_diff(doc_id: str, style: str = Query(...)):
    """Return JSON summary of what would change without actually downloading."""
    data, ext = get_doc(doc_id)
    if ext != ".docx":
        raise HTTPException(400, "Auto-fix only supports .docx files.")
    spec = get_style(style)
    _, changes = _apply_fixes(data, spec)
    return {"changes": changes, "change_count": len(changes)}
