import React, { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { uploadDocument, fetchStyles, compileDocument, downloadFixed, downloadGraderPdf, getChecklist } from '../hooks/useApi'
import { UploadZone } from '../components/UploadZone'
import { StylePicker } from '../components/StylePicker'
import { ScoreGauge } from '../components/ScoreGauge'
import { RadarChart } from '../components/RadarChart'
import { DiagnosticCard } from '../components/DiagnosticCard'
import { ChecklistPanel } from '../components/ChecklistPanel'
import { CitationAudit } from '../components/CitationAudit'
import { TriageBox } from '../components/TriageBox'
import { ShareButton } from '../components/ShareButton'
import { SubmissionChecklist } from '../components/SubmissionChecklist'
import { IconDownload, IconCheck, IconSpinner, IconCompile } from '../components/icons'
import type { SubmissionChecklist as SType } from '../types'

export function HomePage() {
  const {
    uploadResult, selectedStyle, report, styles, loading, error,
    setUploadResult, setSelectedStyle, setReport, setStyles, setLoading, setError,
    addToHistory, dismissedRuleIds, dismissDiagnostic,
  } = useAppStore()

  const [sevFilter, setSevFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [checklist, setChecklist] = useState<SType | null>(null)

  useEffect(() => {
    fetchStyles().then(setStyles).catch(() => setError('Failed to load styles'))
  }, [])

  async function handleFile(file: File) {
    setError(null); setReport(null); setChecklist(null); setLoading(true)
    try { setUploadResult(await uploadDocument(file)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleCompile() {
    if (!uploadResult) return
    setError(null); setLoading(true)
    try {
      const r = await compileDocument(uploadResult.doc_id, selectedStyle)
      setReport(r)
      addToHistory({
        compiled_at: new Date().toISOString(),
        style_id: selectedStyle,
        score: r.score,
        band: r.score_band,
        filename: uploadResult.filename,
      })
      try { const cl = await getChecklist(uploadResult.doc_id, selectedStyle); setChecklist(cl) } catch {}
    }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleDownloadFixed() {
    if (!uploadResult) return
    try {
      const blob = await downloadFixed(uploadResult.doc_id, selectedStyle)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `fixed_${uploadResult.filename}`; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) { setError(e.message) }
  }

  async function handleGraderPdf() {
    if (!uploadResult) return
    try {
      const blob = await downloadGraderPdf(uploadResult.doc_id, selectedStyle)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `grader_report.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) { setError(e.message) }
  }

  const styleName = styles.find(s => s.id === selectedStyle)?.name ?? selectedStyle
  const ruleDiags = report?.diagnostics.filter(d => d.source === 'rule') ?? []
  const llmDiags = report?.diagnostics.filter(d => d.source === 'llm') ?? []
  const filtered = sevFilter === 'all' ? ruleDiags : ruleDiags.filter(d => d.severity === sevFilter)
  const errors = ruleDiags.filter(d => d.severity === 'error').length
  const warnings = ruleDiags.filter(d => d.severity === 'warning').length
  const infos = ruleDiags.filter(d => d.severity === 'info').length

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--c-text)' }}>Compiler</h1>
        <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: '4px 0 0' }}>Upload a paper and check it against an academic style spec</p>
      </div>

      {/* Upload card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <UploadZone onFile={handleFile} disabled={loading} loading={loading}/>
        {uploadResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'var(--c-green)', background: 'var(--c-green-soft)', border: '1px solid var(--c-green-dim)', borderRadius: 8, padding: '8px 12px' }}>
            <IconCheck size={14}/> <strong>{uploadResult.filename}</strong> &mdash; {uploadResult.size_mb.toFixed(2)} MB
          </div>
        )}
        {styles.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <StylePicker styles={styles} selected={selectedStyle} onChange={setSelectedStyle}/>
          </div>
        )}
        {uploadResult && (
          <button onClick={handleCompile} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center', padding: '12px' }}>
            {loading ? <><IconSpinner size={16}/> Compiling&hellip;</> : <><IconCompile size={16}/> Compile paper</>}
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--c-red)', marginBottom: 16 }}>{error}</div>
      )}

      {report && (
        <>
          {/* Report header */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)' }}>Compile Report</div>
                <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 }}>
                  {styleName} &middot; Engine v{report.engine_version} &middot; Ruleset v{report.ruleset_version}
                </div>
                {report.ruleset_last_verified && (
                  <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 1 }}>Last verified: {report.ruleset_last_verified}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {uploadResult && <ShareButton docId={uploadResult.doc_id} style={selectedStyle}/>}
                {uploadResult && (
                  <button onClick={handleDownloadFixed} className="btn btn-secondary btn-sm">
                    <IconDownload size={14}/> Download fixed .docx
                  </button>
                )}
                {uploadResult && (
                  <button onClick={handleGraderPdf} className="btn btn-secondary btn-sm">
                    <IconDownload size={14}/> Grader PDF
                  </button>
                )}
              </div>
            </div>
            {report.partial && (
              <div style={{ marginTop: 12, fontSize: 12, background: 'var(--c-amber-soft)', border: '1px solid var(--c-amber-dim)', borderRadius: 6, padding: '6px 12px', color: 'var(--c-amber)' }}>
                Partial report &mdash; some properties could not be measured reliably
              </div>
            )}
          </div>

          {/* Score + Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alignment Score</div>
              <ScoreGauge score={report.score} band={report.score_band}/>
              {report.citation_audit.weakest_dimension && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--c-text-muted)' }}>
                  Weakest: <strong>{report.citation_audit.weakest_dimension}</strong>
                </div>
              )}
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Per-category scores</div>
              <RadarChart categoryScores={report.category_scores}/>
            </div>
          </div>

          {/* Triage */}
          {report.triage && report.triage.length > 0 && report.score < 90 && (
            <TriageBox triage={report.triage} currentScore={report.score}/>
          )}

          {/* Submission checklist */}
          {checklist && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <SubmissionChecklist checklist={checklist}/>
            </div>
          )}

          {/* Include/Omit */}
          {(report.missing_sections.length > 0 || report.forbidden_or_empty.length > 0) && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 12 }}>Include / Omit checklist</div>
              <ChecklistPanel missing={report.missing_sections} forbidden={report.forbidden_or_empty}/>
            </div>
          )}

          {/* Citation audit */}
          {(report.citation_audit.undefined?.length > 0 || report.citation_audit.unused?.length > 0) && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 12 }}>Citation audit</div>
              <CitationAudit undefined_={report.citation_audit.undefined ?? []} unused={report.citation_audit.unused ?? []}/>
            </div>
          )}

          {/* Parse warnings */}
          {report.parse_warnings.length > 0 && (
            <div style={{ background: 'var(--c-amber-soft)', border: '1px solid var(--c-amber-dim)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: 'var(--c-amber)' }}>
              <strong>Parse warnings:</strong> {report.parse_warnings.join(' · ')}
            </div>
          )}

          {/* Diagnostics */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>
                Diagnostics <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>({errors} errors, {warnings} warnings, {infos} info)</span>
              </div>
              <div className="pill-tabs">
                {(['all', 'error', 'warning', 'info'] as const).map(id => {
                  const count = id === 'all' ? ruleDiags.length : id === 'error' ? errors : id === 'warning' ? warnings : infos
                  const label = id === 'all' ? 'All' : id === 'error' ? 'Errors' : id === 'warning' ? 'Warnings' : 'Info'
                  return (
                    <button key={id} className={`pill-tab${sevFilter === id ? ' active' : ''}`} onClick={() => setSevFilter(id)}>
                      {label} {count > 0 && <span style={{ opacity: 0.7 }}>{count}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.length === 0 && <div style={{ fontSize: 13, color: 'var(--c-green)' }}>No {sevFilter === 'all' ? '' : sevFilter} diagnostics.</div>}
              {filtered.map((d, i) => (
                <DiagnosticCard
                  key={`${d.rule_id}-${i}`}
                  diag={d}
                  dismissed={dismissedRuleIds.has(d.rule_id)}
                  onDismiss={() => dismissDiagnostic(d.rule_id)}
                />
              ))}
            </div>
          </div>

          {/* LLM suggestions */}
          {llmDiags.length > 0 && (
            <div className="card" style={{ padding: 24, border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-purple)', marginBottom: 4 }}>Advisory suggestions</div>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 12 }}>These do not affect the alignment score.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {llmDiags.map((d, i) => <DiagnosticCard key={i} diag={d}/>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
