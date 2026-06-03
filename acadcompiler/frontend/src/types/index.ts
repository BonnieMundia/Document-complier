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
