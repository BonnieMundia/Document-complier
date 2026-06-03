Test fixtures for AcadCompiler conformance suite.

good_apa7/    - A document that satisfies all APA7 rules (baseline)
bad_margins/  - A document with wrong margins (should trigger PAGE.MARGIN.*)
bad_refs/     - A document with undefined citations and unused references
scanned_pdf/  - A PDF with no text layer (should produce parse_warnings, never crash)

Each fixture dir contains:
  - input.docx or input.pdf
  - expected_report.json  (snapshot of CompileReport)
  - expected_rule_ids.txt (list of rule_ids the engine must emit)

Run conformance suite: pytest tests/ -v
