"""Citation symbol table: use/declaration analysis.

In-text citation = use; reference entry = declaration.
Produces CITE.UNDEFINED (error) and REF.UNUSED (warning).
"""
from __future__ import annotations
import re
from ..models import DocumentIR, StyleSpec, Diagnostic


def _normalize_key(text: str) -> str:
    """Normalize a citation key for matching."""
    return re.sub(r'\s+', ' ', text.strip().lower())


def _surname_year(text: str) -> str | None:
    m = re.match(r'([A-Z][A-Za-z\-\']+)(?:\s+et al\.?|(?:\s+and\s+|\s+&\s+)[A-Z][A-Za-z\-\']+)?,?\s+(\d{4})', text)
    if m:
        return f"{m.group(1).lower()}_{m.group(2)}"
    m2 = re.match(r'^\[?(\d+)\]?$', text.strip())
    if m2:
        return m2.group(1)
    return None


def _ref_key(raw: str) -> str | None:
    # Author-date
    m = re.match(r'([A-Z][A-Za-z\-\']+)(?:,?\s+[A-Z]\.?)+,?\s+(\d{4})', raw.strip())
    if m:
        return f"{m.group(1).lower()}_{m.group(2)}"
    # Numeric
    m2 = re.match(r'^\[(\d+)\]', raw.strip())
    if m2:
        return m2.group(1)
    return None


def build_citation_audit(ir: DocumentIR, spec: StyleSpec) -> dict:
    # Build declaration set from references
    declared: dict[str, str] = {}  # key -> raw text
    for ref in ir.references:
        key = _ref_key(ref.raw)
        if key:
            declared[key] = ref.raw

    # Build use set from citations
    used: dict[str, str] = {}
    for cite in ir.citations:
        for raw_key in cite.keys:
            key = _surname_year(raw_key) or _normalize_key(raw_key)
            used[key] = cite.raw

    undefined = []  # cited but not listed
    for key, raw in used.items():
        if key not in declared:
            undefined.append({"key": key, "citation": raw})

    unused = []  # listed but never cited
    for key, raw in declared.items():
        if key not in used:
            unused.append({"key": key, "reference": raw})

    diagnostics = []
    for u in undefined:
        diagnostics.append(Diagnostic(
            rule_id="CITE.UNDEFINED", severity="error",
            category="citation",
            message=f"In-text citation has no matching reference entry: '{u['citation']}'",
            found=u["citation"], expected="matching reference entry",
            evidence=u["citation"], source="rule",
        ))
    for u in unused:
        diagnostics.append(Diagnostic(
            rule_id="REF.UNUSED", severity="warning",
            category="reference",
            message=f"Reference entry is never cited in text: '{u['reference'][:60]}'",
            found=u["reference"][:80], expected="cited in text",
            evidence=u["reference"][:100], source="rule",
        ))

    return {
        "undefined": undefined,
        "unused": unused,
        "diagnostics": diagnostics,
    }
