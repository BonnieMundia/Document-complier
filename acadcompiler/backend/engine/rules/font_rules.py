"""Deterministic font rules."""
from __future__ import annotations
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register

TOLERANCE_PT = 0.5


def _d(rule_id, severity, message, found, expected, evidence, fix_hint="") -> Diagnostic:
    return Diagnostic(
        rule_id=rule_id, severity=severity, category="font",
        message=message, found=found, expected=expected,
        evidence=evidence, fix_hint=fix_hint or None, source="rule"
    )


@register("font_family")
def check_font_family(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected = rule_cfg.get("value") or spec.font.get("family")
    if not expected:
        return []
    found = ir.default_font
    if not found:
        return []
    fallbacks = spec.font.get("fallbacks", [])
    accepted = {expected.lower()} | {f.split()[0].lower() for f in fallbacks}
    if found.lower() not in accepted:
        return [_d(
            "FONT.FAMILY.001", "error",
            f"Default font is '{found}'; expected '{expected}'.",
            found=found, expected=expected,
            evidence=f"Normal style font: {found}",
            fix_hint=f"Change body font to {expected}."
        )]
    return []


@register("font_size")
def check_font_size(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected = spec.font.get("size_pt")
    if not expected:
        return []
    found = ir.default_size_pt
    if not found:
        return []
    if abs(found - expected) > TOLERANCE_PT:
        return [_d(
            "FONT.SIZE.001", "error",
            f"Default font size is {found}pt; expected {expected}pt.",
            found=f"{found}pt", expected=f"{expected}pt",
            evidence=f"Normal style size: {found}pt",
            fix_hint=f"Set body font size to {expected}pt."
        )]
    return []
