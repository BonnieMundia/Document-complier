"""Symbol table unit tests."""
import pytest
from ..models import DocumentIR, Citation, ReferenceEntry, StyleSpec
from ..engine.symbol_table import build_citation_audit, _ref_key, _surname_year


def make_ir(citations=None, references=None) -> DocumentIR:
    return DocumentIR(
        source_format="docx", doc_hash="test",
        page_size="Letter", page_width_in=8.5, page_height_in=11.0,
        margins_in={}, columns=1, default_font=None, default_size_pt=None,
        line_spacing=None, blocks=[], citations=citations or [],
        references=references or [], front_matter={}, word_count=0,
        measurements=[], parse_warnings=[],
    )


def make_spec() -> StyleSpec:
    return StyleSpec(
        id="apa7", name="APA7", authority="APA",
        page={}, font={}, spacing={}, headings=[], citation={},
        references={}, structure={},
        weights={"page": 0.1, "font": 0.1, "spacing": 0.1,
                 "headings": 0.15, "structure": 0.2, "citation": 0.2, "reference": 0.15},
    )


class TestRefKey:
    def test_author_date_key(self):
        key = _ref_key("Walsh, F. (2016). Title. Publisher.")
        assert key == "walsh_2016"

    def test_numeric_key(self):
        key = _ref_key("[3] Author et al. Title.")
        assert key == "3"

    def test_no_match_returns_none(self):
        key = _ref_key("garbled no match")
        assert key is None


class TestSurnameYear:
    def test_basic(self):
        key = _surname_year("Walsh, 2016")
        assert key == "walsh_2016"

    def test_et_al(self):
        key = _surname_year("Kalnay et al., 1996")
        assert key == "kalnay_1996"

    def test_numeric(self):
        key = _surname_year("[3]")
        assert key == "3"


class TestBuildCitationAudit:
    def test_undefined_citation_detected(self):
        cites = [Citation(raw="(Walsh, 2016)", kind="author-date", keys=["Walsh, 2016"], block_index=0)]
        ir = make_ir(citations=cites, references=[])
        audit = build_citation_audit(ir, make_spec())
        assert len(audit["undefined"]) == 1
        assert audit["undefined"][0]["key"] == "walsh_2016"

    def test_unused_reference_detected(self):
        refs = [ReferenceEntry(raw="Walsh, F. (2016). Title.", parsed={}, order_index=0)]
        ir = make_ir(citations=[], references=refs)
        audit = build_citation_audit(ir, make_spec())
        assert len(audit["unused"]) == 1

    def test_matched_pair_no_issues(self):
        cites = [Citation(raw="(Walsh, 2016)", kind="author-date", keys=["Walsh, 2016"], block_index=0)]
        refs = [ReferenceEntry(raw="Walsh, F. M. 2016 Title.", parsed={}, order_index=0)]
        ir = make_ir(citations=cites, references=refs)
        audit = build_citation_audit(ir, make_spec())
        # Both keys should normalize to walsh_2016
        assert audit["undefined"] == []
        assert audit["unused"] == []

    def test_diagnostics_present(self):
        cites = [Citation(raw="(Smith, 2020)", kind="author-date", keys=["Smith, 2020"], block_index=0)]
        ir = make_ir(citations=cites, references=[])
        audit = build_citation_audit(ir, make_spec())
        assert len(audit["diagnostics"]) > 0
        assert audit["diagnostics"][0].rule_id == "CITE.UNDEFINED"
        assert audit["diagnostics"][0].source == "rule"
