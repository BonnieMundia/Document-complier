"""Parse PDFs into DocumentIR using pdfplumber."""
from __future__ import annotations
import hashlib, re
from typing import Optional

from ..models import Block, Citation, Measurement, DocumentIR
from .docx_parser import _extract_citations, _page_size

INCH = 72.0  # pdfplumber uses points; 72pt = 1 inch

def _pt_to_in(pt: Optional[float]) -> Optional[float]:
    return round(pt / INCH, 3) if pt is not None else None


def parse_pdf(data: bytes) -> DocumentIR:
    import pdfplumber

    parse_warnings: list[str] = []
    measurements: list[Measurement] = []
    doc_hash = hashlib.sha256(data).hexdigest()

    import io
    pdf = pdfplumber.open(io.BytesIO(data))

    first_page = pdf.pages[0] if pdf.pages else None
    page_width_in = _pt_to_in(first_page.width) if first_page else None
    page_height_in = _pt_to_in(first_page.height) if first_page else None
    page_size = _page_size(page_width_in, page_height_in)
    measurements.append(Measurement(property="page_size", value=page_size, reliable=page_size != "unknown", source_detail="pdfplumber page 0"))

    # Margin estimation from text bounding box
    all_words = []
    for page in pdf.pages:
        words = page.extract_words()
        all_words.extend([(w["x0"], w["top"], w["x1"], w["bottom"], page.width, page.height) for w in words])

    margins: dict = {"top": None, "bottom": None, "left": None, "right": None}
    if all_words and first_page:
        left_margin = min(w[0] for w in all_words)
        top_margin = min(w[1] for w in all_words)
        right_margin = first_page.width - max(w[2] for w in all_words)
        bottom_margin = first_page.height - max(w[3] for w in all_words)
        margins = {
            "left": round(left_margin / INCH, 3),
            "top": round(top_margin / INCH, 3),
            "right": round(right_margin / INCH, 3),
            "bottom": round(bottom_margin / INCH, 3),
        }

    for side, val in margins.items():
        measurements.append(Measurement(property=f"{side}_margin_in", value=val, reliable=val is not None, source_detail="pdfplumber bounding box"))

    # Extract text blocks
    blocks: list[Block] = []
    citations: list[Citation] = []
    references_raw = []
    word_count = 0
    idx = 0
    in_references = False

    for page_num, page in enumerate(pdf.pages, 1):
        text = page.extract_text()
        if not text:
            parse_warnings.append(f"Page {page_num}: no text layer detected (possibly scanned)")
            continue

        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue
            word_count += len(line.split())

            kind = "body"
            level = None

            if line.lower() in ("references", "bibliography", "works cited"):
                in_references = True
                kind = "heading"
            elif in_references:
                kind = "reference"
            elif re.match(r'^[IVXLCD]+\.\s+', line) or re.match(r'^\d+\.\s+[A-Z]', line):
                kind = "heading"
                level = 1
            elif re.match(r'^[A-Z][a-z].*\.\s*$', line) and len(line) < 80:
                kind = "heading"
                level = 2

            blocks.append(Block(
                index=idx, page=page_num, kind=kind, level=level, text=line,
                font=None, size_pt=None, bold=None, italic=None, alignment=None, style_name=None
            ))

            if kind not in ("reference", "heading"):
                citations.extend(_extract_citations(line, idx))
            elif kind == "reference" and len(line) > 10:
                from .docx_parser import _is_reference_entry, ReferenceEntry
                if _is_reference_entry(line):
                    references_raw.append(ReferenceEntry(raw=line, parsed={}, order_index=len(references_raw)))
            idx += 1

    front_matter: dict = {}
    if blocks:
        front_matter["title"] = blocks[0].text if blocks else None

    return DocumentIR(
        source_format="pdf",
        doc_hash=doc_hash,
        page_size=page_size,
        page_width_in=page_width_in,
        page_height_in=page_height_in,
        margins_in=margins,
        columns=None,
        default_font=None,
        default_size_pt=None,
        line_spacing=None,
        blocks=blocks,
        citations=citations,
        references=references_raw,
        front_matter=front_matter,
        word_count=word_count,
        measurements=measurements,
        parse_warnings=parse_warnings,
    )
