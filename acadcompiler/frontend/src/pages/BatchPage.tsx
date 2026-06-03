import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { uploadDocument, batchCompile } from '../hooks/useApi'
import { UploadZone } from '../components/UploadZone'
import { StylePicker } from '../components/StylePicker'
import { IconSpinner } from '../components/icons'

export function BatchPage() {
  const { styles, batchResults, setBatchResults } = useAppStore()
  const [style, setStyle] = useState('apa7')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: File[]) {
    setError(null); setLoading(true)
    try {
      const uploads = await Promise.all(files.map(f => uploadDocument(f)))
      const results = await batchCompile(uploads.map(u => u.doc_id), style)
      setBatchResults(results)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'var(--c-text)' }}>Batch compile</h1>
      <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: '0 0 24px' }}>Upload multiple papers and check them all at once</p>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <UploadZone onFile={() => {}} onFiles={handleFiles} disabled={loading} loading={loading} multiple/>
        {styles.length > 0 && <div style={{ marginTop: 16 }}><StylePicker styles={styles} selected={style} onChange={setStyle}/></div>}
      </div>

      {error && <div style={{ background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--c-red)', marginBottom: 16 }}>{error}</div>}

      {batchResults && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Mean score', value: `${batchResults.summary.mean_score}%`, color: 'var(--c-text)' },
              { label: 'Pass (green)', value: batchResults.summary.pass_count, color: 'var(--c-green)' },
              { label: 'Fail', value: batchResults.summary.fail_count, color: 'var(--c-red)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>File</th><th>Score</th><th>Band</th><th>Errors</th><th>Warnings</th><th>Top issue</th></tr></thead>
              <tbody>
                {batchResults.results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.filename}</td>
                    <td style={{ fontWeight: 700, color: r.band === 'green' ? 'var(--c-green)' : r.band === 'amber' ? 'var(--c-amber)' : 'var(--c-red)' }}>{r.score !== undefined ? `${Math.round(r.score)}%` : '&mdash;'}</td>
                    <td>{r.band ? <span className={`band-${r.band}`} style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>{r.band}</span> : '&mdash;'}</td>
                    <td style={{ color: (r.error_count ?? 0) > 0 ? 'var(--c-red)' : 'var(--c-text-muted)' }}>{r.error_count ?? '&mdash;'}</td>
                    <td style={{ color: (r.warning_count ?? 0) > 0 ? 'var(--c-amber)' : 'var(--c-text-muted)' }}>{r.warning_count ?? '&mdash;'}</td>
                    <td style={{ fontSize: 12, color: 'var(--c-text-muted)', maxWidth: 300 }}>{r.top_issue || r.error || '&mdash;'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
