from fastapi import APIRouter

router = APIRouter()

@router.get("/{doc_id}")
def get_reports(doc_id: str):
    return {"doc_id": doc_id, "reports": []}
