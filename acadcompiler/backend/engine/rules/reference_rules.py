"""Reference-section rules."""
from __future__ import annotations
from ...models import DocumentIR, StyleSpec, Diagnostic
from ..registry import register


@register("ref_heading_check")
def check_ref_heading(ir: DocumentIR, spec: StyleSpec, rule_cfg: dict) -> list[Diagnostic]:
    expected = spec.references.get("heading", "References")
    ref_headings = [b for b in ir.blocks if b.kind == "heading" and
                    b.text.strip().lower() in (expected.lower(), "references", "bibliography")]
    if not ref_headings and ir.references:
        return [Diagnostic(
            rule_id="REF.HEADING.001", severity="warning",
            category="reference",
            message=f"Reference section heading should be '{expected}'.",
            found="not found", expected=expected,
            evidence=f"Expected heading '{expected}' not detected",
            source="rule",
        )]
    return []
