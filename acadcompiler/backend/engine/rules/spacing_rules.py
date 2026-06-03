"""Line-spacing rules."""
from __future__ import annotations
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register

SPACING_MAP = {"double": 2.0, "single": 1.0, "onehalf": 1.5}
TOLERANCE = 0.1


@register("line_spacing")
def check_line_spacing(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected_str = spec.spacing.get("line", "double")
    expected_val = SPACING_MAP.get(expected_str, 2.0)
    found = ir.line_spacing
    if found is None:
        return []
    if abs(found - expected_val) > TOLERANCE:
        return [Diagnostic(
            rule_id="SPACING.LINE.001", severity="error", category="spacing",
            message=f"Line spacing is {found}; expected {expected_str} ({expected_val}).",
            found=str(found), expected=f"{expected_str} ({expected_val})",
            evidence=f"Normal style line_spacing={found}",
            fix_hint=f"Set line spacing to {expected_str} in Paragraph settings.",
            source="rule",
        )]
    return []
