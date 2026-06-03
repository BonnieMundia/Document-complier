import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { formatCitation, importBibtex } from '../hooks/useApi'
import { StylePicker } from '../components/StylePicker'
import { IconSpinner } from '../components/icons'
import type { BibtexEntry } from '../types'

export function CitePage() {
  const { styles } = useAppStore()
  const [tab, setTab] = useState<'doi' | 'raw' | 'bibtex'>('doi')
  const [doi, setDoi] = useState('')
  const [raw, setRaw] = useState('')
  const [style, setStyle] = useState('apa7')
  const [result, setResult] = useState<{ formatted: string; fields: Record<string, string> } | null>(null)
  const [bibtexEntries, setBibtexEntries] = useState<BibtexEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFormat() {
    setError(null); setLoading(true)
    try { setResult(await formatCitation(raw, style, doi || undefined)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleBibtex(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try { setBibtexEntries((await importBibtex(file)).entries) }
    catch (e: any) { setError((e as any).message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'var(--c-text)' }}>Citation formatter</h1>
      <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: '0 0 24px' }}>Format a citation for any style from a DOI, raw text, or BibTeX file</p>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="pill-tabs" style={{ marginBottom: 20 }}>
          {(['doi', 'raw', 'bibtex'] as const).map(t => (
            <button key={t} className={`pill-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'doi' ? 'DOI / URL' : t === 'raw' ? 'Raw text' : 'BibTeX file'}
            </button>
          ))}
        </div>

        {styles.length > 0 && tab !== 'bibtex' && <div style={{ marginBottom: 16 }}><StylePicker styles={styles} selected={style} onChange={setStyle}/></div>}

        {tab === 'doi' && (
          <div>
            <label className="label">DOI</label>
            <input className="input" value={doi} onChange={e => setDoi(e.target.value)} placeholder="10.xxxx/yyyyyyy"/>
          </div>
        )}
        {tab === 'raw' && (
          <div>
            <label className="label">Paste raw citation text</label>
            <textarea className="input" value={raw} onChange={e => setRaw(e.target.value)} rows={4} placeholder="Walsh, F. (2016). Strengthening family resilience..."/>
          </div>
        )}
        {tab === 'bibtex' && (
          <div>
            <label className="label">Upload .bib file</label>
            <input type="file" accept=".bib" onChange={handleBibtex} className="input" style={{ padding: '6px 12px' }}/>
          </div>
        )}

        {tab !== 'bibtex' && (
          <button onClick={handleFormat} disabled={loading || (!doi && !raw)} className="btn btn-primary" style={{ marginTop: 16 }}>
            {loading ? <><IconSpinner size={14}/> Formatting&hellip;</> : 'Format citation'}
          </button>
        )}
      </div>

      {error && <div style={{ background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--c-red)', marginBottom: 16 }}>{error}</div>}

      {result && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: 8 }}>Formatted citation ({style})</div>
          <div className="mono" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', borderRadius: 8, padding: '12px 16px', fontSize: 13, lineHeight: 1.6, userSelect: 'all' }}>
            {result.formatted}
          </div>
          <button onClick={() => navigator.clipboard.writeText(result.formatted)} className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>Copy</button>
        </div>
      )}

      {bibtexEntries && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border)', fontSize: 13, fontWeight: 600 }}>
            {bibtexEntries.length} entries parsed
          </div>
          <table className="data-table">
            <thead><tr><th>Key</th><th>Type</th><th>Author</th><th>Year</th><th>Title</th></tr></thead>
            <tbody>
              {bibtexEntries.map((e, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 11 }}>{e.key}</td>
                  <td style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--c-primary)' }}>{e.type}</td>
                  <td style={{ fontSize: 12 }}>{e.fields.author?.slice(0, 30) || '&mdash;'}</td>
                  <td style={{ fontSize: 12 }}>{e.fields.year || '&mdash;'}</td>
                  <td style={{ fontSize: 12, color: 'var(--c-text-2)' }}>{(e.fields.title || '&mdash;').slice(0, 50)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
