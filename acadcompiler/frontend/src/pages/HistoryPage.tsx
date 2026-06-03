import React from 'react'
import { useAppStore } from '../store/useAppStore'

export function HistoryPage() {
  const { compileHistory } = useAppStore()

  if (compileHistory.length === 0) {
    return (
      <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'var(--c-text)' }}>History</h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>No compile history yet. Run a compile on the Compiler tab.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: 'var(--c-text)' }}>History</h1>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>File</th><th>Style</th><th>Score</th><th>Band</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {compileHistory.map((h, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{h.filename || '&mdash;'}</td>
                <td><span style={{ fontSize: 11, background: 'var(--c-primary-soft)', color: 'var(--c-primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{h.style_id}</span></td>
                <td style={{ fontWeight: 700, color: h.band === 'green' ? 'var(--c-green)' : h.band === 'amber' ? 'var(--c-amber)' : 'var(--c-red)' }}>{Math.round(h.score)}%</td>
                <td><span className={`band-${h.band}`} style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{h.band}</span></td>
                <td style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{new Date(h.compiled_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
