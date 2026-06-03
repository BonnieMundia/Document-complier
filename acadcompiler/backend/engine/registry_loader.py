"""Load and run applicable rules from a StyleSpec YAML."""
from __future__ import annotations
from ..models import DocumentIR, StyleSpec, Diagnostic
from .registry import get_rule
from .rules import *  # noqa: F401,F403 — triggers all self-registrations


def _parse_check(check_str: str) -> tuple[str, dict]:
    """Parse 'function_key:param1:param2' into (key, {param: value}) dict."""
    parts = check_str.split(":")
    key = parts[0]
    cfg: dict = {}
    for part in parts[1:]:
        # Try key=value
        if "=" in part:
            k, v = part.split("=", 1)
            cfg[k] = v
        else:
            # positional: level, value etc.
            if "level" not in cfg:
                # Try to detect if it's a number
                try:
                    cfg["level"] = int(part)
                except ValueError:
                    cfg["value"] = part
            else:
                cfg["value"] = part
    return key, cfg


def run_all_rules(ir: DocumentIR, spec: StyleSpec) -> list[Diagnostic]:
    """Run all applicable rules for the given style spec."""
    diagnostics: list[Diagnostic] = []

    # Standard category rules (always run)
    standard_checks = [
        ("page_size", {}),
        ("margin_check", {}),
        ("column_count", {}),
        ("mirror_margins", {}),
        ("font_family", {}),
        ("font_size", {}),
        ("line_spacing", {}),
        ("heading_case", {}),
        ("heading_bold", {}),
        ("required_sections", {}),
        ("front_matter_fields", {}),
        ("ref_heading_check", {}),
        ("ref_order_alpha", {}),
    ]

    for check_key, cfg in standard_checks:
        fn = get_rule(check_key)
        if fn is None:
            continue
        try:
            diags = fn(ir, spec, cfg)
            diagnostics.extend(diags)
        except Exception as e:
            diagnostics.append(Diagnostic(
                rule_id=f"ENGINE.RULE.ERROR.{check_key.upper()[:20]}",
                severity="info",
                category="engine",
                message=f"Rule '{check_key}' failed: {e}",
                found=str(e), expected="no error",
                evidence=f"Rule function raised: {type(e).__name__}: {e}",
                source="rule",
            ))

    # Special rules from YAML
    for special in spec.special_rules:
        check_str = special.get("check", "")
        if not check_str:
            continue
        key, cfg = _parse_check(check_str)
        fn = get_rule(key)
        if fn is None:
            continue
        try:
            diags = fn(ir, spec, cfg)
            for d in diags:
                d.rule_id = special.get("id", d.rule_id)
                d.severity = special.get("severity", d.severity)
                d.spec_reference = special.get("spec_reference")
                d.needs_review = special.get("needs_review", False)
            diagnostics.extend(diags)
        except Exception as e:
            diagnostics.append(Diagnostic(
                rule_id=f"ENGINE.SPECIAL.ERROR.{special.get('id','?')[:20]}",
                severity="info",
                category="engine",
                message=f"Special rule '{special.get('id')}' failed: {e}",
                found=str(e), expected="no error",
                evidence=str(e),
                source="rule",
            ))

    return diagnostics
