from fastapi import APIRouter, UploadFile, File, HTTPException
from ...parsing.ir import build_ir_from_docx, build_ir_from_pdf
from ..config import settings
import hashlib

router = APIRouter()

# In-memory store for demo; replace with Supabase Storage
_doc_store: dict = {}


@router.post("/")
async def upload_document(file: UploadFile = File(...)):
    ext = "." + (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in settings.allowed_extensions:
        raise HTTPException(400, f"File type {ext} not allowed. Use .docx or .pdf.")

    data = await file.read()
    size_mb = len(data) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(413, f"File exceeds {settings.max_upload_mb}MB limit.")

    doc_hash = hashlib.sha256(data).hexdigest()
    doc_id = doc_hash[:16]
    _doc_store[doc_id] = {
        "data": data,
        "ext": ext,
        "hash": doc_hash,
        "filename": file.filename,
        "last_report": None,
        "compile_history": [],
    }

    return {"doc_id": doc_id, "doc_hash": doc_hash, "filename": file.filename, "size_mb": round(size_mb, 2)}


def get_doc(doc_id: str) -> tuple[bytes, str]:
    """Return (data, ext) for a stored document."""
    doc = _doc_store.get(doc_id)
    if not doc:
        raise HTTPException(404, f"Document {doc_id} not found.")
    return doc["data"], doc["ext"]


def get_doc_entry(doc_id: str) -> dict:
    """Return the full doc store entry."""
    doc = _doc_store.get(doc_id)
    if not doc:
        raise HTTPException(404, f"Document {doc_id} not found.")
    return doc


def store_last_report(doc_id: str, report_dict: dict) -> None:
    """Store the last compile report and append to history (max 10)."""
    if doc_id not in _doc_store:
        return
    _doc_store[doc_id]["last_report"] = report_dict
    history = _doc_store[doc_id].setdefault("compile_history", [])
    history.insert(0, {
        "compiled_at": report_dict.get("compiled_at"),
        "style_id": report_dict.get("style_id"),
        "score": report_dict.get("score"),
        "band": report_dict.get("score_band"),
    })
    # keep max 10
    _doc_store[doc_id]["compile_history"] = history[:10]
