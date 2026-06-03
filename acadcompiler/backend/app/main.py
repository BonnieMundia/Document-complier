from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import upload, parse, compile, styles, reports, templates

app = FastAPI(
    title="AcadCompiler",
    description="Academic paper style checker — deterministic diagnostics, no hallucinations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(parse.router, prefix="/parse", tags=["parse"])
app.include_router(compile.router, prefix="/compile", tags=["compile"])
app.include_router(styles.router, prefix="/styles", tags=["styles"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(templates.router, prefix="/templates", tags=["templates"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/ready")
def ready():
    return {"status": "ready"}
