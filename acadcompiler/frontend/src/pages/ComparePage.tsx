import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { uploadDocument, multiCompile } from '../hooks/useApi'
import { UploadZone } from '../components/UploadZone'
import { IconSpinner } from '../components/icons'

const BAND_COLOR: Record<string, string> = { green: '#059669', amber: '#d97706', red: '#dc2626' }

export function ComparePage() {
  const { styles, compareResults, setCompareResults, uploadResult, setUploadResult } = useAppStore()
  const [selected, setSelected] = useState<string[]>(['apa7', 'ieee'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    const r = await uploadDocument(file)
    setUploadResult(r)
    setCompareResults(null)
  }

  async function handleCompare() {
    if (!uploadResult) return
    setError(null); setLoading(true)
    try {
      const r = await multiCompile(uploadResult.doc_id, selected)
      setCompareResults(r)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const sortedResults = compareResults
    ? Object.entries(compareResults).sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0))
    : []

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'var(--c-text)' }}>Multi-style compare</h1>
      <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: '0 0 24px' }}>Score one paper against multiple styles at once</p>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <UploadZone onFile={handleFile} disabled={loading}/>
        {uploadResult && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-green)' }}>Loaded: {uploadResult.filename}</div>}
        <div style={{ marginTop: 16 }}>
          <span className="label">Compare against styles</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {styles.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={selected.includes(s.id)} onChange={e => {
                  setSelected(p => e.target.checked ? [...p, s.id] : p.filter(x => x !== s.id))
                }}/>
                {s.id}
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleCompare} disabled={loading || !uploadResult || selected.length === 0} className="btn btn-primary" style={{ marginTop: 16 }}>
          {loading ? <><IconSpinner size={14}/> Comparing&hellip;</> : 'Compare'}
        </button>
      </div>

      {error && <div style={{ background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--c-red)', marginBottom: 16 }}>{error}</div>}

      {sortedResults.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Results &mdash; sorted by score</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedResults.map(([styleId, data]) => {
              const score = data.score ?? 0
              const color = BAND_COLOR[data.band ?? 'red']
              return (
                <div key={styleId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{styles.find(s => s.id === styleId)?.name || styleId}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{Math.round(score)}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--c-border-soft)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }}/>
                  </div>
                  {data.top_3_issues && data.top_3_issues.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--c-text-muted)' }}>Top issue: {data.top_3_issues[0]}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
