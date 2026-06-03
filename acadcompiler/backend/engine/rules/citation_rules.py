"""Citation format rules."""
from __future__ import annotations
import re
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register


@register("intext_pattern")
def check_intext_pattern(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """AMS: no comma before year in author-date citations."""
    diags = []
    style_id = spec.id.lower()
    if "ams" not in style_id:
        return []
    bad_re = re.compile(r'\([A-Z][A-Za-z\-]+(?:\s+et al\.?)?,\s+\d{4}\)')
    for c in ir.citations:
        if bad_re.search(c.raw):
            b = next((b for b in ir.blocks if b.index == c.block_index), None)
            loc = f"¶{c.block_index}" if b is None else f"p.{b.page} ¶{c.block_index}"
            diags.append(Diagnostic(
                rule_id="AMS.CITE.NOCOMMA", severity="warning",
                category="citation",
                message=f"AMS style uses no comma before year in '{c.raw}'.",
                found=c.raw, expected="(Author Year) without comma",
                evidence=c.raw, location=loc, source="rule",
            ))
    return diags


@register("ref_unnumbered_alpha")
def check_ref_unnumbered(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    diags = []
    for ref in ir.references:
        if re.match(r'^\[\d+\]', ref.raw.strip()):
            diags.append(Diagnostic(
                rule_id="AMS.REFS.NONUM", severity="error",
                category="reference",
                message=f"AMS references should not be numbered: '{ref.raw[:60]}'",
                found=ref.raw[:80], expected="unnumbered, alphabetical",
                evidence=ref.raw[:100], source="rule",
            ))
    return diags


@register("ref_numeric_order")
def check_ref_numeric_order(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """IEEE: references numbered in citation order."""
    if not ir.citations or not ir.references:
        return []
    num_refs = []
    for ref in ir.references:
        m = re.match(r'^\[(\d+)\]', ref.raw.strip())
        if m:
            num_refs.append(int(m.group(1)))
    if not num_refs:
        return []
    expected = list(range(1, len(num_refs) + 1))
    if num_refs != expected:
        return [Diagnostic(
            rule_id="IEEE.REF.NUMORDER", severity="error",
            category="reference",
            message="IEEE references must be numbered in citation order starting from [1].",
            found=str(num_refs[:5]), expected=str(expected[:5]),
            evidence=f"Reference numbers found: {num_refs[:10]}",
            source="rule",
        )]
    return []


@register("ref_order_alpha")
def check_ref_order_alpha(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """Check alphabetical reference ordering."""
    if len(ir.references) < 2:
        return []
    surnames = []
    for ref in ir.references:
        m = re.match(r'^([A-Z][A-Za-z\'\-]+)', ref.raw.strip())
        surnames.append(m.group(1).lower() if m else "")
    diags = []
    for i in range(len(surnames) - 1):
        if surnames[i] and surnames[i+1] and surnames[i] > surnames[i+1]:
            diags.append(Diagnostic(
                rule_id="APA.REFS.ORDER", severity="error",
                category="reference",
                message=f"Reference out of alphabetical order: '{ir.references[i+1].raw[:60]}'",
                found=ir.references[i+1].raw[:80],
                expected=f"After '{ir.references[i].raw[:40]}'",
                evidence=f"'{surnames[i]}' > '{surnames[i+1]}'",
                source="rule",
            ))
    return diags


@register("ref_entry_pattern")
def check_ref_entry_pattern(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """AMS: year followed by colon in reference entry."""
    diags = []
    if "ams" not in spec.id.lower():
        return []
    year_colon = re.compile(r'\b\d{4}:\s')
    for ref in ir.references:
        if not year_colon.search(ref.raw):
            diags.append(Diagnostic(
                rule_id="AMS.REF.YEARCOLON", severity="warning",
                category="reference",
                message=f"AMS reference entry should have year followed by colon: '{ref.raw[:60]}'",
                found=ref.raw[:80], expected="Surname, F. M., Year: Title.",
                evidence=ref.raw[:100], source="rule",
            ))
    return diags


@register("abstract_leadins")
def check_abstract_leadins(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """IEEE: Abstract bold 'Abstract—' lead-in."""
    abstract_blocks = [b for b in ir.blocks if b.kind == "abstract"]
    if not abstract_blocks:
        return []
    first = abstract_blocks[0]
    if not first.text.startswith("Abstract"):
        return [Diagnostic(
            rule_id="IEEE.ABSTRACT.FMT", severity="warning",
            category="structure",
            message="IEEE abstract should start with bold 'Abstract—' lead-in.",
            found=first.text[:80], expected="Abstract— ...",
            evidence=first.text[:100], source="rule",
        )]
    return []


@register("bib_entry_pattern")
def check_bib_entry_oscola(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """OSCOLA: bibliography entries should not end with full stop."""
    diags = []
    for ref in ir.references:
        if ref.raw.strip().endswith(".") and "oscola" in spec.id.lower():
            diags.append(Diagnostic(
                rule_id="OSCOLA.BIB.NODOT", severity="warning",
                category="reference",
                message=f"OSCOLA bibliography entries should not end with a full stop: '{ref.raw[:60]}'",
                found=ref.raw[-10:], expected="no trailing full stop",
                evidence=ref.raw[:100], source="rule",
            ))
    return diags


@register("footnote_full_then_short")
def check_footnote(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    """OSCOLA: first footnote full, subsequent short form."""
    fn_blocks = [b for b in ir.blocks if b.kind == "footnote"]
    if not fn_blocks:
        return []
    ibid_count = sum(1 for b in fn_blocks if "ibid" in b.text.lower() or "op. cit" in b.text.lower())
    if ibid_count > 0:
        return [Diagnostic(
            rule_id="OSCOLA.FN.FULLTHENSHORT", severity="warning",
            category="citation",
            message="OSCOLA uses short form (not ibid/op. cit.) for subsequent citations.",
            found=f"{ibid_count} ibid/op.cit. usage(s)",
            expected="short form (Author, 'Title' (n X))",
            evidence=f"Found in {ibid_count} footnote(s)",
            source="rule",
        )]
    return []
