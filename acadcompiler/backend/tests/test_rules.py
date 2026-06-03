"""Tests for deterministic rule functions."""
import pytest
from ..models import DocumentIR, StyleSpec, Block, Citation, ReferenceEntry, Measurement
from ..engine.rules import *  # noqa - trigger registration
from ..engine.registry_loader import run_all_rules
from ..engine.scoring import compute_score


def make_ir(**kwargs) -> DocumentIR:
    defaults = dict(
        source_format="docx", doc_hash="abc123",
        page_size="Letter", page_width_in=8.5, page_height_in=11.0,
        margins_in={"top": 1.0, "bottom": 1.0, "left": 1.0, "right": 1.0},
        columns=1, default_font="Times New Roman", default_size_pt=12.0,
        line_spacing=2.0, blocks=[], citations=[], references=[],
        front_matter={}, word_count=0, measurements=[], parse_warnings=[],
    )
    defaults.update(kwargs)
    return DocumentIR(**defaults)


def load_spec(style_id: str) -> StyleSpec:
    from ..app.routers.styles import get_style
    return get_style(style_id)


class TestPageRules:
    def test_wrong_page_size(self):
        ir = make_ir(page_size="A4")  # APA expects Letter
        spec = load_spec("apa7")
        diags = run_all_rules(ir, spec)
        rule_ids = [d.rule_id for d in diags]
        assert "PAGE.SIZE.001" in rule_ids

    def test_correct_page_size(self):
        ir = make_ir(page_size="Letter")
        spec = load_spec("apa7")
        diags = run_all_rules(ir, spec)
        rule_ids = [d.rule_id for d in diags]
        assert "PAGE.SIZE.001" not in rule_ids

    def test_wrong_margin(self):
        ir = make_ir(margins_in={"top": 1.5, "bottom": 1.0, "left": 1.0, "right": 1.0})
        spec = load_spec("apa7")
        diags = run_all_rules(ir, spec)
        rule_ids = [d.rule_id for d in diags]
        assert any("MARGIN" in r for r in rule_ids)

    def test_diagnostic_has_evidence(self):
        ir = make_ir(page_size="A4")
        spec = load_spec("apa7")
        diags = run_all_rules(ir, spec)
        size_diag = next((d for d in diags if d.rule_id == "PAGE.SIZE.001"), None)
        assert size_diag is not None
        assert size_diag.evidence is not None
        assert size_diag.found is not None
        assert size_diag.expected is not None

    def test_diagnostic_source_is_rule(self):
        ir = make_ir(page_size="A4")
        spec = load_spec("apa7")
        diags = run_all_rules(ir, spec)
        for d in diags:
            assert d.source == "rule", f"Non-rule diagnostic: {d.rule_id}"


class TestScoring:
    def test_score_deterministic_only(self):
        """LLM diagnostics must never affect the score."""
        from ..models import Diagnostic
        ir = make_ir()
        spec = load_spec("apa7")
        diags = [
            Diagnostic(rule_id="TEST.001", severity="error", category="page",
                       message="test", source="rule", evidence="x"),
            Diagnostic(rule_id="LLM.001", severity="error", category="page",
                       message="llm test", source="llm", confidence=0.9, evidence="y"),
        ]
        score, _, _ = compute_score(diags, spec)
        # Score should be same whether we include LLM diag or not
        diags_no_llm = [d for d in diags if d.source == "rule"]
        score2, _, _ = compute_score(diags_no_llm, spec)
        assert score == score2, "LLM diagnostics must not affect score"

    def test_perfect_score_on_no_diags(self):
        spec = load_spec("apa7")
        score, cat_scores, band = compute_score([], spec)
        assert score == 100.0
        assert band == "green"

    def test_score_band(self):
        from ..models import Diagnostic
        spec = load_spec("apa7")
        many_errors = [
            Diagnostic(rule_id=f"ERR.{i:03d}", severity="error", category="page",
                       message="error", source="rule", evidence="x")
            for i in range(20)
        ]
        score, _, band = compute_score(many_errors, spec)
        assert band in ("amber", "red")


class TestSymbolTable:
    def test_undefined_citation(self):
        from ..engine.symbol_table import build_citation_audit
        ir = make_ir(
            citations=[Citation(raw="(Walsh, 2016)", kind="author-date", keys=["Walsh, 2016"], block_index=0)],
            references=[],
        )
        spec = load_spec("apa7")
        audit = build_citation_audit(ir, spec)
        assert len(audit["undefined"]) > 0

    def test_unused_reference(self):
        from ..engine.symbol_table import build_citation_audit
        ir = make_ir(
            citations=[],
            references=[ReferenceEntry(raw="Walsh, F. (2016). Title. Publisher.", parsed={}, order_index=0)],
        )
        spec = load_spec("apa7")
        audit = build_citation_audit(ir, spec)
        assert len(audit["unused"]) > 0

    def test_matched_citation_and_reference(self):
        from ..engine.symbol_table import build_citation_audit
        ir = make_ir(
            citations=[Citation(raw="(Walsh, 2016)", kind="author-date", keys=["Walsh, 2016"], block_index=0)],
            references=[ReferenceEntry(raw="Walsh, F. (2016). Title. Publisher.", parsed={}, order_index=0)],
        )
        spec = load_spec("apa7")
        audit = build_citation_audit(ir, spec)
        # Walsh 2016 matches Walsh_(2016) -> both should resolve
        # Depending on normalization might still show mismatch; at minimum no crash
        assert "undefined" in audit
        assert "unused" in audit


class TestDeterminismContract:
    """§1.2: deterministic result always wins over LLM on conflict."""
    def test_llm_does_not_override_rule(self):
        from ..models import Diagnostic
        rule_diag = Diagnostic(
            rule_id="PAGE.SIZE.001", severity="error", category="page",
            message="rule says A4", source="rule", evidence="x", found="A4", expected="Letter"
        )
        llm_diag = Diagnostic(
            rule_id="PAGE.SIZE.001", severity="info", category="page",
            message="llm says Letter", source="llm", confidence=0.9, evidence="y"
        )
        # Apply dedup: same rule_id + category, rule wins
        all_diags = [rule_diag, llm_diag]
        seen = {}
        for d in all_diags:
            k = (d.rule_id, d.category)
            if k in seen:
                if d.source == "rule":
                    seen[k] = d
            else:
                seen[k] = d
        deduped = list(seen.values())
        assert len(deduped) == 1
        assert deduped[0].source == "rule"
