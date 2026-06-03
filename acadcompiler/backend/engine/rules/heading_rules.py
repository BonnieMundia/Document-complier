"""Heading format rules."""
from __future__ import annotations
import re
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register

_MINOR_WORDS = {"a","an","the","and","but","or","for","nor","on","at","to","by","in","of","up","as","is"}


def _case_check(text: str, case: str) -> bool:
    if case == "upper":
        return text == text.upper()
    if case == "title":
        words = text.split()
        for i, w in enumerate(words):
            core = re.sub(r'[^A-Za-z]', '', w)
            if not core:
                continue
            if i == 0 or w.lower() not in _MINOR_WORDS:
                if not core[0].isupper():
                    return False
        return True
    if case == "sentence":
        words = text.split()
        if not words:
            return True
        if not words[0][0].isupper():
            return False
        for w in words[1:]:
            core = re.sub(r'[^A-Za-z]', '', w)
            if core and core[0].isupper() and w.lower() not in ("i",):
                return False
        return True
    return True


@register("heading_case")
def check_heading_case(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    level = int(rule_cfg.get("level", 1))
    expected_case = rule_cfg.get("case", "title")
    heading_spec = next((h for h in spec.headings if h.get("level") == level), None)
    if heading_spec:
        expected_case = heading_spec.get("case", expected_case)

    diags = []
    for b in ir.blocks:
        if b.kind == "heading" and b.level == level:
            if not _case_check(b.text, expected_case):
                diags.append(Diagnostic(
                    rule_id=f"HEADING.CASE.L{level}.001", severity="warning",
                    category="headings",
                    message=f"Level-{level} heading should be {expected_case} case: '{b.text[:60]}'",
                    found=b.text[:80], expected=f"{expected_case} case",
                    evidence=b.text[:120],
                    fix_hint=f"Restyle heading to {expected_case} case.",
                    source="rule",
                ))
    return diags


@register("heading_bold")
def check_heading_bold(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    diags = []
    for h_spec in spec.headings:
        level = h_spec.get("level")
        expected_bold = h_spec.get("bold", False)
        for b in ir.blocks:
            if b.kind == "heading" and b.level == level:
                if b.bold is not None and b.bold != expected_bold:
                    diags.append(Diagnostic(
                        rule_id=f"HEADING.BOLD.L{level}.001", severity="warning",
                        category="headings",
                        message=f"Level-{level} heading bold={'yes' if expected_bold else 'no'} required.",
                        found="bold" if b.bold else "not bold",
                        expected="bold" if expected_bold else "not bold",
                        evidence=b.text[:80],
                        source="rule",
                    ))
    return diags
