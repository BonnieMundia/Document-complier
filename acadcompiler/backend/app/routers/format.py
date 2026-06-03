"""Format router — placeholder for future auto-fix endpoints."""
from fastapi import APIRouter

router = APIRouter()


@router.post("/{doc_id}")
def format_document(doc_id: str, style: str = "apa7"):
    return {"status": "auto-format not yet implemented", "doc_id": doc_id, "style": style, "needs_review": True}
