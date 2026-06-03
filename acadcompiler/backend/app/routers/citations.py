"""Citation formatting and BibTeX import router."""
from __future__ import annotations
import re
import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Body

router = APIRouter()


def _parse_bibtex(text: str) -> list[dict]:
    """Simple regex BibTeX parser — no external dep."""
    entries = []
    entry_re = re.compile(r'@(\w+)\s*\{\s*([^,]+),([^@]*)\}', re.DOTALL)
    field_re = re.compile(r'(\w+)\s*=\s*[\{"](.*?)[\}"](?:\s*,|\s*$)', re.DOTALL)
    for m in entry_re.finditer(text):
        entry_type = m.group(1).lower()
        key = m.group(2).strip()
        fields_text = m.group(3)
        fields = {}
        for fm in field_re.finditer(fields_text):
            fields[fm.group(1).lower()] = fm.group(2).strip().replace("\n", " ")
        entries.append({"key": key, "type": entry_type, "fields": fields})
    return entries


def _format_apa(fields: dict) -> str:
    author = fields.get("author", "Unknown")
    year = fields.get("year", "n.d.")
    title = fields.get("title", "Untitled")
    journal = fields.get("journal", fields.get("booktitle", ""))
    volume = fields.get("volume", "")
    pages = fields.get("pages", "")
    doi = fields.get("doi", "")
    s = f"{author} ({year}). {title}."
    if journal:
        s += f" {journal}"
    if volume:
        s += f", {volume}"
    if pages:
        s += f", {pages}"
    s += "."
    if doi:
        s += f" https://doi.org/{doi}"
    return s


def _format_ieee(fields: dict) -> str:
    author = fields.get("author", "Unknown")
    title = fields.get("title", "Untitled")
    journal = fields.get("journal", fields.get("booktitle", ""))
    volume = fields.get("volume", "")
    pages = fields.get("pages", "")
    year = fields.get("year", "n.d.")
    doi = fields.get("doi", "")
    s = f'{author}, "{title},"'
    if journal:
        s += f" {journal},"
    if volume:
        s += f" vol. {volume},"
    if pages:
        s += f" pp. {pages},"
    s += f" {year}."
    if doi:
        s += f" doi: {doi}."
    return s


FORMATTERS = {"apa7": _format_apa, "apa": _format_apa, "ieee": _format_ieee}


@router.post("/format")
def format_citation(body: dict = Body(...)):
    """Format a raw citation string or DOI for a target style."""
    raw = body.get("raw", "")
    style = body.get("style", "apa7")
    doi = body.get("doi", "")

    fields: dict = {}

    if doi:
        # Try to fetch metadata from doi.org
        try:
            import urllib.request
            req = urllib.request.Request(
                f"https://doi.org/{doi.strip()}",
                headers={"Accept": "application/x-bibtex"},
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                bib_text = resp.read().decode("utf-8", errors="replace")
            parsed = _parse_bibtex(bib_text)
            if parsed:
                fields = parsed[0]["fields"]
        except Exception:
            fields = {"doi": doi, "title": "DOI lookup failed — paste raw text instead"}

    if not fields and raw:
        # Rough parse of raw text
        year_m = re.search(r'\b(\d{4})\b', raw)
        author_m = re.match(r'^([A-Z][A-Za-z\-\']+(?:,\s+[A-Z]\.?)*)', raw)
        fields = {
            "author": author_m.group(1) if author_m else "",
            "year": year_m.group(1) if year_m else "n.d.",
            "title": raw[:100],
        }

    fmt_fn = FORMATTERS.get(style, _format_apa)
    formatted = fmt_fn(fields) if fields else raw

    return {"formatted": formatted, "style_id": style, "fields": fields}


@router.post("/bibtex")
async def import_bibtex(file: UploadFile = File(...)):
    """Parse a .bib file and return structured entries."""
    if not (file.filename or "").endswith(".bib"):
        raise HTTPException(400, "Only .bib files accepted")
    data = await file.read()
    text = data.decode("utf-8", errors="replace")
    entries = _parse_bibtex(text)
    return {"entries": entries, "count": len(entries)}
