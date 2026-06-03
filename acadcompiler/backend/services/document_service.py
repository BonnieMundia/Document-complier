"""Document service — orchestrates upload, parse, and storage."""
from __future__ import annotations
from ..models import DocumentIR
from ..parsing.ir import build_ir_from_docx, build_ir_from_pdf


def parse_document(data: bytes, ext: str) -> DocumentIR:
    """Parse document bytes into a DocumentIR based on file extension."""
    if ext == ".docx":
        return build_ir_from_docx(data)
    elif ext == ".pdf":
        return build_ir_from_pdf(data)
    else:
        raise ValueError(f"Unsupported format: {ext}")
