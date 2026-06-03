"""Standalone scoring tests."""
import pytest
from ..models import Diagnostic, StyleSpec
from ..engine.scoring import compute_score, weakest_dimension


def make_spec_weights(**weights) -> StyleSpec:
    """Build a minimal StyleSpec for scoring tests."""
    default_weights = {"page": 0.10, "font": 0.10, "spacing": 0.10,
                       "headings": 0.15, "structure": 0.20, "citation": 0.20, "reference": 0.15}
    default_weights.update(weights)
    return StyleSpec(
        id="test", name="Test", authority="Test",
        page={}, font={}, spacing={}, headings=[], citation={},
        references={}, structure={}, weights=default_weights,
    )


def make_diag(rule_id="X.001", severity="error", category="page", source="rule") -> Diagnostic:
    return Diagnostic(
        rule_id=rule_id, severity=severity, category=category,
        message="test", source=source, evidence="x",
    )


class TestComputeScore:
    def test_no_diagnostics_100(self):
        spec = make_spec_weights()
        score, cats, band = compute_score([], spec)
        assert score == 100.0
        assert band == "green"
        for v in cats.values():
            assert v == 100.0

    def test_single_error_reduces_page_score(self):
        spec = make_spec_weights()
        diags = [make_diag(category="page", severity="error")]
        score, cats, band = compute_score(diags, spec)
        assert cats["page"] < 100.0
        assert score < 100.0

    def test_llm_diag_excluded(self):
        spec = make_spec_weights()
        rule_d = make_diag(severity="error", source="rule")
        llm_d = make_diag(rule_id="LLM.001", severity="error", source="llm")
        score_with_llm, _, _ = compute_score([rule_d, llm_d], spec)
        score_without_llm, _, _ = compute_score([rule_d], spec)
        assert score_with_llm == score_without_llm

    def test_warning_less_penalty_than_error(self):
        spec = make_spec_weights()
        error_score, _, _ = compute_score([make_diag(severity="error")], spec)
        warning_score, _, _ = compute_score([make_diag(severity="warning")], spec)
        assert warning_score > error_score

    def test_band_thresholds(self):
        spec = make_spec_weights()
        # No diags -> green
        _, _, band = compute_score([], spec)
        assert band == "green"

        # Many errors -> red
        many = [make_diag(rule_id=f"E.{i}", category="page") for i in range(10)]
        _, _, band = compute_score(many, spec)
        assert band in ("amber", "red")


class TestWeakestDimension:
    def test_returns_lowest_category(self):
        cats = {"page": 90.0, "font": 50.0, "spacing": 80.0}
        assert weakest_dimension(cats) == "font"

    def test_empty_returns_none(self):
        assert weakest_dimension({}) == "none"

    def test_all_equal(self):
        cats = {"page": 75.0, "font": 75.0}
        result = weakest_dimension(cats)
        assert result in ("page", "font")
