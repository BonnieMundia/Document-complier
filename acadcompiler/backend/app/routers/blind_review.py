"""Blind review scanner — detects author-identifying text."""
from __future__ import annotations
import re
from fastapi import APIRouter
from .upload import get_doc, get_doc_entry
from ...parsing.ir import build_ir_from_docx, build_ir_from_pdf

router = APIRouter()

BLIND_PATTERNS = [
    (r'\bin our (previous|earlier|prior|recent)\b', "Self-reference: 'in our previous/earlier work'"),
    (r'\bwe (showed?|demonstrated?|found|argued?|proposed?)\b', "First-person claim: 'we showed/found'"),
    (r'\bour (earlier|previous|prior) (work|study|paper|research|findings)\b', "Self-reference to prior work"),
    (r'\bas we (noted?|described?|discussed?|showed?)\b', "Self-reference: 'as we noted'"),
    (r'\b(university|college|institute|department) of \w+', "Possible affiliation mention"),
    (r'\b[A-Z][a-z]+ (university|college)\b', "Possible institution name"),
]


@router.get("/{doc_id}")
def blind_review(doc_id: str):
    data, ext = get_doc(doc_id)
    entry = get_doc_entry(doc_id)

    try:
        ir = build_ir_from_docx(data) if ext == ".docx" else build_ir_from_pdf(data)
    except Exception as e:
        return {"error": str(e), "issues": [], "clean": False}

    issues = []
    for block in ir.blocks:
        text = block.text
        for pattern, label in BLIND_PATTERNS:
            for m in re.finditer(pattern, text, re.IGNORECASE):
                issues.append({
                    "block_index": block.index,
                    "page": block.page,
                    "pattern_matched": label,
                    "text": text[:200],
                    "match": m.group(0),
                    "location": f"p.{block.page} ¶{block.index}" if block.page else f"¶{block.index}",
                })

    return {
        "issues": issues,
        "clean": len(issues) == 0,
        "issue_count": len(issues),
        "filename": entry.get("filename", ""),
    }
