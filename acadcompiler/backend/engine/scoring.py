"""Deterministic scoring engine.

Score is computed entirely from rule diagnostics — no LLM output ever moves the number.
"""
from __future__ import annotations
from ..models import StyleSpec, Diagnostic

SEVERITY_PENALTIES = {
    "error": 1.0,   # full penalty: contributes 0% to that rule's weight
    "warning": 0.5, # half penalty
    "info": 0.1,    # small penalty
}

BANDS = [
    (90, "green"),
    (70, "amber"),
    (0, "red"),
]


def compute_score(diagnostics: list[Diagnostic], spec: StyleSpec) -> tuple[float, dict[str, float], str]:
    """Return (overall_score, category_scores, band).

    LLM-sourced diagnostics are excluded from scoring.
    """
    weights = spec.weights
    rule_diags = [d for d in diagnostics if d.source == "rule"]

    # Group by category
    by_cat: dict[str, list[Diagnostic]] = {}
    for cat in weights:
        by_cat[cat] = []
    for d in rule_diags:
        cat = d.category
        if cat in by_cat:
            by_cat[cat].append(d)

    category_scores: dict[str, float] = {}
    overall_numerator = 0.0
    overall_denominator = 0.0

    for cat, cat_weight in weights.items():
        diags = by_cat.get(cat, [])
        if not diags:
            # No issues in category = perfect score
            category_scores[cat] = 100.0
            overall_numerator += cat_weight * 100.0
        else:
            # Each diagnostic is weighted equally within its category for now
            penalty_sum = sum(SEVERITY_PENALTIES.get(d.severity, 0.5) for d in diags)
            # Cap penalty at 100%
            penalty_pct = min(100.0, penalty_sum * 20)  # Each error = 20 pts off
            cat_score = max(0.0, 100.0 - penalty_pct)
            category_scores[cat] = round(cat_score, 1)
            overall_numerator += cat_weight * cat_score
        overall_denominator += cat_weight

    overall = round(overall_numerator / overall_denominator, 1) if overall_denominator else 0.0

    band = "red"
    for threshold, band_name in BANDS:
        if overall >= threshold:
            band = band_name
            break

    return overall, category_scores, band


def weakest_dimension(category_scores: dict[str, float]) -> str:
    if not category_scores:
        return "none"
    return min(category_scores, key=lambda k: category_scores[k])
