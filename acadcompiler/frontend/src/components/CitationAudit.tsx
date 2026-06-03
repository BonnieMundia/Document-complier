import React from 'react'
import { IconError, IconWarning } from './icons'

interface Props {
  undefined_: Array<{ key: string; citation: string }>
  unused: Array<{ key: string; reference: string }>
}

export function CitationAudit({ undefined_, unused }: Props) {
  if (undefined_.length === 0 && unused.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--c-green)' }}>All citations matched &mdash; no undefined or unused references.</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {undefined_.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <IconError size={14} /><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-red)' }}>Undefined &mdash; cited but not in reference list ({undefined_.length})</span>
          </div>
          {undefined_.map((u, i) => (
            <div key={i} className="mono" style={{ fontSize: 12, background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 6, padding: '6px 10px', marginBottom: 4 }}>{u.citation}</div>
          ))}
        </div>
      )}
      {unused.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <IconWarning size={14}/><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-amber)' }}>Unused &mdash; in reference list but never cited ({unused.length})</span>
          </div>
          {unused.map((u, i) => (
            <div key={i} className="mono" style={{ fontSize: 12, background: 'var(--c-amber-soft)', border: '1px solid var(--c-amber-dim)', borderRadius: 6, padding: '6px 10px', marginBottom: 4 }}>{u.reference}</div>
          ))}
        </div>
      )}
    </div>
  )
}
