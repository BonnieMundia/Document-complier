"""Batch compile router."""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Body
from .compile import _run_compile
from .upload import get_doc_entry

router = APIRouter()


@router.post("/compile")
def batch_compile(body: dict = Body(...)):
    doc_ids = body.get("doc_ids", [])
    style = body.get("style", "apa7")
    if not doc_ids:
        raise HTTPException(400, "Provide 'doc_ids' list.")

    results = []
    for doc_id in doc_ids:
        entry = get_doc_entry(doc_id)
        try:
            r = _run_compile(doc_id, style)
            errors = sum(1 for d in r.diagnostics if d.severity == "error" and d.source == "rule")
            warnings = sum(1 for d in r.diagnostics if d.severity == "warning" and d.source == "rule")
            top = r.diagnostics[0].message[:80] if r.diagnostics else None
            results.append({
                "doc_id": doc_id,
                "filename": entry.get("filename", doc_id),
                "score": r.score,
                "band": r.score_band,
                "error_count": errors,
                "warning_count": warnings,
                "top_issue": top,
            })
        except Exception as e:
            results.append({"doc_id": doc_id, "filename": entry.get("filename", doc_id), "error": str(e)})

    valid = [r for r in results if "score" in r]
    mean_score = round(sum(r["score"] for r in valid) / len(valid), 1) if valid else 0
    pass_count = sum(1 for r in valid if r["band"] == "green")

    return {
        "results": results,
        "summary": {
            "mean_score": mean_score,
            "pass_count": pass_count,
            "fail_count": len(valid) - pass_count,
            "total": len(results),
        },
    }
