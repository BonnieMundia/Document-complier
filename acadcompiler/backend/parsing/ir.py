"""IR builder helpers."""
from __future__ import annotations
from ..models import DocumentIR

def build_ir_from_docx(data: bytes) -> DocumentIR:
    from .docx_parser import parse_docx
    return parse_docx(data)

def build_ir_from_pdf(data: bytes) -> DocumentIR:
    from .pdf_parser import parse_pdf
    return parse_pdf(data)
