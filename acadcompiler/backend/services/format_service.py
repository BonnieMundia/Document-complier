"""Format service — placeholder for future auto-fix document formatting."""
from __future__ import annotations
from ..models import DocumentIR, StyleSpec


def apply_formatting(ir: DocumentIR, spec: StyleSpec, data: bytes, ext: str) -> bytes:
    """Apply style formatting to a document. Not yet implemented."""
    raise NotImplementedError(
        "Auto-format is not yet implemented. "
        "Use the compile endpoint to identify issues, then fix manually."
    )
