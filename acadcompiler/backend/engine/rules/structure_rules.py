"""Document structure rules (required/optional/forbidden sections)."""
from __future__ import annotations
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register


def _heading_texts(ir: DocumentIR) -> list[str]:
    return [b.text.lower().strip() for b in ir.blocks if b.kind == "heading"]


@register("required_sections")
def check_required_sections(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    required = spec.structure.get("required_ordered", [])
    headings = _heading_texts(ir)
    diags = []
    for section in required:
        section_lower = section.lower().replace("_", " ")
        if any(section_lower in h for h in headings):
            continue
        if section == "abstract" and any(b.kind == "abstract" for b in ir.blocks):
            continue
        if section in ("title_page", "title_block", "title") and any(b.kind == "title" for b in ir.blocks):
            continue
        diags.append(Diagnostic(
            rule_id=f"STRUCT.MISSING.{section.upper()[:10]}", severity="warning",
            category="structure",
            message=f"Required section '{section}' not found.",
            found="absent", expected=f"section: {section}",
            evidence=f"Searched headings: {headings[:5]}",
            source="rule",
        ))
    return diags


@register("front_matter_fields")
def check_front_matter(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    diags = []
    style_id = spec.id.lower()
    if "apa" in style_id:
        for field in ["title", "author", "affiliation", "course", "instructor", "date"]:
            if not ir.front_matter.get(field):
                diags.append(Diagnostic(
                    rule_id=f"FRONTMATTER.{field.upper()[:8]}.001", severity="info",
                    category="structure",
                    message=f"Title page may be missing '{field}' field.",
                    found="not detected", expected=field,
                    evidence=f"front_matter keys: {list(ir.front_matter.keys())}",
                    source="rule",
                ))
    return diags


@register("abstract_word_limit")
def check_abstract_word_limit(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    limit = int(rule_cfg.get("limit", 250))
    abstract_blocks = [b for b in ir.blocks if b.kind == "abstract"]
    if not abstract_blocks:
        return []
    full_text = " ".join(b.text for b in abstract_blocks)
    wc = len(full_text.split())
    if wc > limit:
        return [Diagnostic(
            rule_id="ABSTRACT.WORDLIMIT.001", severity="error",
            category="structure",
            message=f"Abstract is {wc} words; limit is {limit}.",
            found=str(wc), expected=f"≤{limit}",
            evidence=full_text[:200],
            fix_hint=f"Reduce abstract to {limit} words.",
            source="rule",
        )]
    return []


@register("abstract_heading_is_title_caps")
def check_abstract_heading(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    abstract_idx = next((i for i, b in enumerate(ir.blocks) if b.kind == "abstract"), None)
    if abstract_idx is None or abstract_idx == 0:
        return []
    prev = ir.blocks[abstract_idx - 1]
    if prev.kind == "heading" and prev.text == prev.text.upper():
        return []
    return [Diagnostic(
        rule_id="ASA.ABSTRACT.HEAD", severity="error",
        category="structure",
        message="Abstract page heading should be the paper title in ALL CAPS.",
        found=prev.text[:80], expected="PAPER TITLE IN ALL CAPS",
        evidence=prev.text[:120],
        source="rule",
    )]


@register("abstract_one_para_keywords")
def check_abstract_keywords(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    kw_block = next(
        (b for b in ir.blocks if b.kind == "keywords" or "keywords:" in b.text.lower()), None
    )
    if not kw_block:
        return [Diagnostic(
            rule_id="ASA.ABSTRACT.KW", severity="warning",
            category="structure",
            message="Abstract should be followed by 'Keywords: 3-5 keywords'.",
            found="no keywords line found", expected="Keywords: ...",
            evidence="keywords block absent",
            source="rule",
        )]
    return []
