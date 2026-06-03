export interface Diagnostic {
  rule_id: string
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
  location?: string
  found?: string
  expected?: string
  evidence?: string
  fix_hint?: string
  auto_fixable: boolean
  spec_reference?: string
  source: 'rule' | 'llm'
  confidence?: number
  needs_review: boolean
}

export interface CompileReport {
  style_id: string
  ruleset_version: string
  ruleset_last_verified: string
  engine_version: string
  csl_version: string
  model_version?: string
  score: number
  category_scores: Record<string, number>
  score_band: 'green' | 'amber' | 'red'
  diagnostics: Diagnostic[]
  missing_sections: string[]
  forbidden_or_empty: string[]
  citation_audit: {
    undefined: Array<{ key: string; citation: string }>
    unused: Array<{ key: string; reference: string }>
    weakest_dimension?: string
  }
  parse_warnings: string[]
  partial: boolean
  triage: Array<{
    rule_id: string; severity: string; category: string
    score_impact: number; message: string; fix_hint?: string; projected_after?: number
  }>
}

export interface StyleSummary {
  id: string
  name: string
  authority: string
  edition?: string
  last_verified?: string
}

export interface UploadResponse {
  doc_id: string
  doc_hash: string
  filename: string
  size_mb: number
}

export interface HistoryEntry {
  compiled_at: string; style_id: string; score: number
  band: 'green' | 'amber' | 'red'; filename?: string
}

export interface BatchResultItem {
  doc_id: string; filename: string; score?: number; band?: string
  error_count?: number; warning_count?: number; top_issue?: string; error?: string
}

export interface BatchResult {
  results: BatchResultItem[]
  summary: { mean_score: number; pass_count: number; fail_count: number; total: number }
}

export interface ChecklistItem {
  check: string; label: string; status: 'pass' | 'fail' | 'unknown'; detail?: string
}

export interface SubmissionChecklist {
  items: ChecklistItem[]; ready: boolean
  pass_count: number; fail_count: number; unknown_count: number
}

export interface BibtexEntry { key: string; type: string; fields: Record<string, string> }

export type Tab = 'compiler' | 'history' | 'batch' | 'compare' | 'cite' | 'handbook'

export interface HandbookStyleSummary {
  id: string
  name: string
  authority: string
  edition: string
  discipline: string
  template_source: 'uploaded' | 'internet'
  template_url?: string
  has_template_file: boolean
  has_samples: boolean
  sample_count: number
  color: string
}

export interface HandbookSample {
  id: string
  title: string
  description: string
  filename: string
}

export interface HandbookNotes {
  overview: string
  page_setup?: string
  font?: string
  spacing?: string
  headings?: string
  citations?: string
  references?: string
  title_page?: string
  cases?: string
  legislation?: string
  secondary?: string
  abstract?: string
  figures?: string
  common_mistakes?: string[]
  special_notes?: string[]
  key_changes_from_6th?: string[]
}

export interface HandbookStyleDetail {
  id: string
  name: string
  full_name: string
  authority: string
  edition: string
  discipline: string
  template_source: 'uploaded' | 'internet'
  template_url?: string
  template_file?: string
  color: string
  notes: HandbookNotes
  samples: HandbookSample[] | null
}
