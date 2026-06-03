"""Parse .docx files into DocumentIR."""
from __future__ import annotations
import io, re, hashlib
from typing import Optional
import docx
from docx import Document
from docx.shared import Inches, Pt
from lxml import etree

from ..models import Block, Citation, ReferenceEntry, Measurement, DocumentIR
from .sanitize import safe_open_docx, safe_parse_xml

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{WORD_NS}}}"

EMU_PER_INCH = 914400
EMU_PER_TWIP = 635


def _twips_to_in(twips: Optional[str]) -> Optional[float]:
    if twips is None:
        return None
    try:
        return int(twips) / 1440.0
    except (ValueError, TypeError):
        return None


def _emu_to_in(emu: Optional[str]) -> Optional[float]:
    if emu is None:
        return None
    try:
        return int(emu) / EMU_PER_INCH
    except (ValueError, TypeError):
        return None


def _page_size(width_in: Optional[float], height_in: Optional[float]) -> str:
    if width_in is None or height_in is None:
        return "unknown"
    if abs(width_in - 8.5) < 0.1 and abs(height_in - 11.0) < 0.1:
        return "Letter"
    if abs(width_in - 8.27) < 0.1 and abs(height_in - 11.69) < 0.1:
        return "A4"
    return "unknown"


AUTHOR_DATE_RE = re.compile(
    r'\(([A-Z][A-Za-z\-\']+(?:\s+(?:et al\.?|and|&)\s+[A-Z][A-Za-z\-\']+)*),?\s+(\d{4}[a-z]?)(?:,\s*p+p?\.\s*\d+[\-\d]*)?\)'
)
NUMERIC_BRACKET_RE = re.compile(r'\[(\d+(?:,\s*\d+)*(?:\-\d+)?)\]')
NUMERIC_SUPER_RE = re.compile(r'(?<!\w)\^(\d+)(?!\w)')


def _extract_citations(text: str, block_index: int) -> list[Citation]:
    citations = []
    for m in AUTHOR_DATE_RE.finditer(text):
        keys = [m.group(0).strip("()")]
        citations.append(Citation(raw=m.group(0), kind="author-date", keys=keys, block_index=block_index))
    for m in NUMERIC_BRACKET_RE.finditer(text):
        keys = [n.strip() for n in re.split(r"[,\-]", m.group(1))]
        citations.append(Citation(raw=m.group(0), kind="numeric", keys=keys, block_index=block_index))
    return citations


def _infer_block_kind(para) -> tuple[str, Optional[int]]:
    style = para.style.name if para.style else ""
    sl = style.lower()
    if "heading 1" in sl:
        return "heading", 1
    if "heading 2" in sl:
        return "heading", 2
    if "heading 3" in sl:
        return "heading", 3
    if "heading 4" in sl:
        return "heading", 4
    if "title" in sl:
        return "title", None
    if "abstract" in sl:
        return "abstract", None
    if "caption" in sl:
        return "caption", None
    return "body", None


REF_ENTRY_RE = re.compile(
    r'^(?:\[\d+\]\s+)?[A-Z][A-Za-z\'\-]+,?\s+[A-Z][\w\.\s\'\-]+[\.,]\s+\(?(\d{4})\)?'
)


def _is_reference_entry(text: str) -> bool:
    return bool(REF_ENTRY_RE.match(text.strip()))


def _get_para_font(para) -> tuple[Optional[str], Optional[float]]:
    """Get font from runs or paragraph style."""
    for run in para.runs:
        if run.font.name:
            size = run.font.size.pt if run.font.size else None
            return run.font.name, size
    if para.style and para.style.font:
        name = para.style.font.name
        size = para.style.font.size.pt if para.style.font.size else None
        return name, size
    return None, None


def _get_para_alignment(para) -> Optional[str]:
    al = para.alignment
    if al is None:
        return None
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    mapping = {
        WD_ALIGN_PARAGRAPH.LEFT: "left",
        WD_ALIGN_PARAGRAPH.CENTER: "center",
        WD_ALIGN_PARAGRAPH.RIGHT: "right",
        WD_ALIGN_PARAGRAPH.JUSTIFY: "justify",
    }
    return mapping.get(al)


def parse_docx(data: bytes) -> DocumentIR:
    parse_warnings: list[str] = []
    measurements: list[Measurement] = []

    doc_hash = hashlib.sha256(data).hexdigest()

    try:
        zf = safe_open_docx(data)
    except Exception as e:
        raise ValueError(f"Cannot open .docx: {e}")

    doc = Document(io.BytesIO(data))

    # --- Page geometry from sectPr ---
    try:
        sect_xml = zf.read("word/document.xml")
        root = safe_parse_xml(sect_xml)
        ns = WORD_NS
        sect_pr = root.find(f".//{W}sectPr")

        pg_sz = sect_pr.find(f"{W}pgSz") if sect_pr is not None else None
        page_width_in = _emu_to_in(pg_sz.get(f"{W}w")) if pg_sz is not None else None
        page_height_in = _emu_to_in(pg_sz.get(f"{W}h")) if pg_sz is not None else None

        # twips for margins
        pg_mar = sect_pr.find(f"{W}pgMar") if sect_pr is not None else None
        margins: dict = {}
        if pg_mar is not None:
            for side in ("top", "bottom", "left", "right"):
                val = _twips_to_in(pg_mar.get(f"{W}{side}"))
                margins[side] = val
                measurements.append(Measurement(
                    property=f"{side}_margin_in",
                    value=val,
                    reliable=val is not None,
                    source_detail="word/document.xml sectPr pgMar"
                ))
            mirror = pg_mar.get(f"{W}mirrorMargins")
            mirror_margins = mirror is not None
        else:
            margins = {"top": None, "bottom": None, "left": None, "right": None}
            mirror_margins = False
            parse_warnings.append("No pgMar found; margins unknown")

        # columns
        cols_el = sect_pr.find(f"{W}cols") if sect_pr is not None else None
        columns = None
        if cols_el is not None:
            num = cols_el.get(f"{W}num")
            columns = int(num) if num else 1
        measurements.append(Measurement(property="columns", value=columns, reliable=columns is not None, source_detail="sectPr cols"))

    except Exception as e:
        parse_warnings.append(f"sectPr parsing error: {e}")
        page_width_in = page_height_in = None
        margins = {"top": None, "bottom": None, "left": None, "right": None}
        columns = None
        mirror_margins = False

    # --- Default font / spacing from Normal style ---
    default_font: Optional[str] = None
    default_size_pt: Optional[float] = None
    line_spacing: Optional[float] = None

    try:
        normal = doc.styles["Normal"]
        if normal.font.name:
            default_font = normal.font.name
        if normal.font.size:
            default_size_pt = normal.font.size.pt
        pf = normal.paragraph_format
        if pf.line_spacing is not None:
            if pf.line_spacing_rule is not None:
                from docx.enum.text import WD_LINE_SPACING
                rule = pf.line_spacing_rule
                if rule == WD_LINE_SPACING.DOUBLE:
                    line_spacing = 2.0
                elif rule == WD_LINE_SPACING.SINGLE:
                    line_spacing = 1.0
                elif rule == WD_LINE_SPACING.ONE_POINT_FIVE:
                    line_spacing = 1.5
                else:
                    # Exact/at least — value is in EMU
                    if isinstance(pf.line_spacing, int):
                        line_spacing = round(pf.line_spacing / 240.0, 2)  # twips per line
            else:
                if isinstance(pf.line_spacing, float):
                    line_spacing = round(pf.line_spacing, 2)
    except Exception as e:
        parse_warnings.append(f"Default style read error: {e}")

    measurements.append(Measurement(property="default_font", value=default_font, reliable=default_font is not None, source_detail="Normal style"))
    measurements.append(Measurement(property="default_size_pt", value=default_size_pt, reliable=default_size_pt is not None, source_detail="Normal style"))
    measurements.append(Measurement(property="line_spacing", value=line_spacing, reliable=line_spacing is not None, source_detail="Normal style"))

    # --- Blocks ---
    blocks: list[Block] = []
    citations: list[Citation] = []
    references_raw: list[ReferenceEntry] = []
    word_count = 0
    in_references = False

    for idx, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue
        word_count += len(text.split())

        kind, level = _infer_block_kind(para)
        font_name, font_size = _get_para_font(para)
        align = _get_para_alignment(para)

        bold = any(run.bold for run in para.runs if run.text.strip()) or None
        italic = any(run.italic for run in para.runs if run.text.strip()) or None

        if text.strip().lower() in ("references", "bibliography", "works cited", "reference list"):
            in_references = True
            kind = "heading"

        if in_references and kind == "body":
            kind = "reference"
            if _is_reference_entry(text):
                references_raw.append(ReferenceEntry(raw=text, parsed={}, order_index=len(references_raw)))

        block = Block(
            index=idx, page=None, kind=kind, level=level, text=text,
            font=font_name or default_font, size_pt=font_size or default_size_pt,
            bold=bold, italic=italic, alignment=align,
            style_name=para.style.name if para.style else None,
        )
        blocks.append(block)

        if kind not in ("reference", "heading") and kind != "title":
            cites = _extract_citations(text, idx)
            citations.extend(cites)

    # --- Front matter ---
    front_matter: dict = {}
    if blocks:
        front_matter["title"] = next((b.text for b in blocks if b.kind == "title"), None)
        front_matter["abstract"] = next((b.text for b in blocks if b.kind == "abstract"), None)

    page_size = _page_size(page_width_in, page_height_in)
    measurements.append(Measurement(property="page_size", value=page_size, reliable=page_size != "unknown", source_detail="sectPr pgSz"))
    measurements.append(Measurement(property="mirror_margins", value=mirror_margins, reliable=True, source_detail="sectPr pgMar"))

    return DocumentIR(
        source_format="docx",
        doc_hash=doc_hash,
        page_size=page_size,
        page_width_in=page_width_in,
        page_height_in=page_height_in,
        margins_in=margins,
        columns=columns,
        default_font=default_font,
        default_size_pt=default_size_pt,
        line_spacing=line_spacing,
        blocks=blocks,
        citations=citations,
        references=references_raw,
        front_matter=front_matter,
        word_count=word_count,
        measurements=measurements,
        parse_warnings=parse_warnings,
    )
