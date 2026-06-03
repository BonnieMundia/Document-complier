"""Deterministic page-geometry rules."""
from __future__ import annotations
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register


def _m(rule_id: str, severity: str, category: str, message: str, found: str,
        expected: str, evidence: str, fix_hint: str = "", spec_ref: str = "") -> Diagnostic:
    return Diagnostic(
        rule_id=rule_id, severity=severity, category=category,
        message=message, found=found, expected=expected,
        evidence=evidence, fix_hint=fix_hint or None,
        spec_reference=spec_ref or None, source="rule",
    )


@register("page_size")
def check_page_size(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected = spec.page.get("size", "unknown")
    found = ir.page_size
    if found == "unknown":
        return []
    if found != expected:
        return [_m(
            "PAGE.SIZE.001", "error", "page",
            f"Page size is {found} but {expected} is required.",
            found=found, expected=expected,
            evidence=f"Measured page {ir.page_width_in}×{ir.page_height_in} in",
            fix_hint=f"Change page size to {expected} in Page Setup."
        )]
    return []


@register("margin_check")
def check_margins(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    diags = []
    expected_margins = spec.page.get("margins_in", {})
    TOLERANCE = 0.05
    for side, exp_val in expected_margins.items():
        if exp_val is None:
            continue
        found_val = ir.margins_in.get(side)
        if found_val is None:
            continue
        if abs(found_val - exp_val) > TOLERANCE:
            diags.append(_m(
                f"PAGE.MARGIN.{side.upper()[:1]}01", "error", "page",
                f"{side.capitalize()} margin is {found_val:.2f}in, expected {exp_val:.2f}in.",
                found=f"{found_val:.2f}in", expected=f"{exp_val:.2f}in",
                evidence=f"Measured {side} margin from sectPr: {found_val:.3f}in",
                fix_hint=f"Set {side} margin to {exp_val}in in Page Setup."
            ))
    return diags


@register("column_count")
def check_columns(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected = spec.page.get("columns", 1)
    if "value" in rule_cfg:
        expected = int(rule_cfg["value"])
    found = ir.columns
    if found is None:
        return []
    if found != expected:
        return [_m(
            "PAGE.COLS.001", "error", "page",
            f"Document has {found} column(s); {expected} required.",
            found=str(found), expected=str(expected),
            evidence=f"sectPr cols num={found}",
            fix_hint=f"Set {expected} column(s) in Layout > Columns."
        )]
    return []


@register("mirror_margins")
def check_mirror_margins(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected = spec.page.get("mirror_margins", False)
    m = next((m for m in ir.measurements if m.property == "mirror_margins"), None)
    if m is None:
        return []
    found = m.value
    if found != expected:
        return [_m(
            "PAGE.MIRROR.001", "info", "page",
            f"Mirror margins {'enabled' if found else 'disabled'}; expected {'enabled' if expected else 'disabled'}.",
            found=str(found), expected=str(expected),
            evidence=f"sectPr mirrorMargins={found}",
            fix_hint="Enable/disable mirror margins in Page Setup."
        )]
    return []
