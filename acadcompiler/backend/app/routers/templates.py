from fastapi import APIRouter

router = APIRouter()

@router.post("/ingest")
def ingest_template():
    return {"status": "template ingestion not yet implemented", "needs_review": True}

@router.post("/confirm")
def confirm_template():
    return {"status": "template confirmation not yet implemented"}
