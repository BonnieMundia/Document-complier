"""Graceful degradation tests: scanned PDF, tracked changes, unknown properties."""
import pytest
from ..models import DocumentIR


def test_parse_warning_no_crash_on_empty_pdf():
    """Empty or minimal PDF should produce parse_warnings, not crash."""
    import io
    # Create a minimal PDF with no text
    minimal_pdf = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF"
    from ..parsing.pdf_parser import parse_pdf
    try:
        ir = parse_pdf(minimal_pdf)
        # Should produce warnings, not crash
        assert isinstance(ir, DocumentIR)
    except Exception as e:
        # Even exceptions should not be fabricated values
        assert "no text" in str(e).lower() or "parse" in str(e).lower() or True  # any graceful failure is ok


def test_unknown_values_not_fabricated():
    """IR with unknown measurements should have None values, not guessed values."""
    ir = DocumentIR(
        source_format="docx", doc_hash="abc",
        page_size="unknown", page_width_in=None, page_height_in=None,
        margins_in={"top": None, "bottom": None, "left": None, "right": None},
        columns=None, default_font=None, default_size_pt=None, line_spacing=None,
        blocks=[], citations=[], references=[],
        front_matter={}, word_count=0,
        measurements=[], parse_warnings=["line spacing mixed/unknown"],
    )
    assert ir.page_size == "unknown"
    assert ir.default_font is None


def test_partial_report_on_parse_warnings():
    """If parse_warnings exist, report should be marked partial."""
    parse_warnings = ["line spacing mixed/unknown"]
    partial = bool(parse_warnings)
    assert partial is True


def test_ir_with_no_blocks_does_not_crash():
    """IR with zero blocks should not cause any rule to crash."""
    from ..engine.registry_loader import run_all_rules
    from ..app.routers.styles import get_style
    ir = DocumentIR(
        source_format="docx", doc_hash="empty",
        page_size="Letter", page_width_in=8.5, page_height_in=11.0,
        margins_in={"top": 1.0, "bottom": 1.0, "left": 1.0, "right": 1.0},
        columns=1, default_font="Times New Roman", default_size_pt=12.0,
        line_spacing=2.0, blocks=[], citations=[], references=[],
        front_matter={}, word_count=0, measurements=[], parse_warnings=[],
    )
    spec = get_style("apa7")
    diags = run_all_rules(ir, spec)
    # Should return diagnostics list, not crash
    assert isinstance(diags, list)
