from fastapi import APIRouter, HTTPException
from ...parsing.ir import build_ir_from_docx, build_ir_from_pdf
from ...models import DocumentIR
from .upload import get_doc

router = APIRouter()


@router.post("/{doc_id}")
def parse_document(doc_id: str) -> DocumentIR:
    data, ext = get_doc(doc_id)
    try:
        if ext == ".docx":
            return build_ir_from_docx(data)
        elif ext == ".pdf":
            return build_ir_from_pdf(data)
        else:
            raise HTTPException(400, f"Unsupported format: {ext}")
    except Exception as e:
        raise HTTPException(422, f"Parse error: {e}")
