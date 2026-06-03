from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal, Optional

class Block(BaseModel):
    index: int
    page: Optional[int] = None
    kind: Literal["title","author","heading","body","caption","reference",
                  "abstract","keywords","figure","table","footnote","other"]
    level: Optional[int] = None
    text: str
    font: Optional[str] = None
    size_pt: Optional[float] = None
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    alignment: Optional[Literal["left","center","right","justify"]] = None
    style_name: Optional[str] = None

class Citation(BaseModel):
    raw: str
    kind: Literal["author-date","numeric","superscript","footnote","marker"]
    keys: list[str]
    block_index: int

class ReferenceEntry(BaseModel):
    raw: str
    parsed: dict
    order_index: int

class Measurement(BaseModel):
    property: str
    value: object
    reliable: bool
    source_detail: Optional[str] = None

class DocumentIR(BaseModel):
    source_format: Literal["docx","pdf"]
    doc_hash: str
    page_size: Literal["A4","Letter","unknown"]
    page_width_in: Optional[float] = None
    page_height_in: Optional[float] = None
    margins_in: dict
    columns: Optional[int] = None
    default_font: Optional[str] = None
    default_size_pt: Optional[float] = None
    line_spacing: Optional[float] = None
    blocks: list[Block]
    citations: list[Citation]
    references: list[ReferenceEntry]
    front_matter: dict
    word_count: int
    measurements: list[Measurement]
    parse_warnings: list[str]

class Diagnostic(BaseModel):
    rule_id: str
    severity: Literal["error","warning","info"]
    category: str
    message: str
    location: Optional[str] = None
    found: Optional[str] = None
    expected: Optional[str] = None
    evidence: Optional[str] = None
    fix_hint: Optional[str] = None
    auto_fixable: bool = False
    spec_reference: Optional[str] = None
    source: Literal["rule","llm"] = "rule"
    confidence: Optional[float] = None
    needs_review: bool = False

class CompileReport(BaseModel):
    style_id: str
    ruleset_version: str
    ruleset_last_verified: str
    engine_version: str
    csl_version: str
    model_version: Optional[str] = None
    score: float
    category_scores: dict[str, float]
    score_band: Literal["green","amber","red"]
    diagnostics: list[Diagnostic]
    missing_sections: list[str]
    forbidden_or_empty: list[str]
    citation_audit: dict
    parse_warnings: list[str]
    partial: bool
    triage: list[dict] = Field(default_factory=list)

class StyleSpec(BaseModel):
    id: str
    name: str
    authority: str
    version: Optional[str] = None
    edition: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[str] = None
    page: dict
    font: dict
    spacing: dict
    headings: list[dict]
    citation: dict
    references: dict
    structure: dict
    special_rules: list[dict] = Field(default_factory=list)
    weights: dict
