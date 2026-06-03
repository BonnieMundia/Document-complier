import React from 'react'
import type { StyleSummary } from '../types'

interface Props { styles: StyleSummary[]; selected: string; onChange: (id: string) => void }

export function StylePicker({ styles, selected, onChange }: Props) {
  const sel = styles.find(s => s.id === selected)
  return (
    <div>
      <label className="label">Target style</label>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="input"
        style={{ appearance: 'auto' }}
      >
        {styles.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}{s.edition ? ` (${s.edition})` : ''} &mdash; {s.authority}
          </option>
        ))}
      </select>
      {sel?.last_verified && (
        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4 }}>
          Last verified: {sel.last_verified === 'VERIFY-AGAINST-MANUAL' ? <span style={{ color: 'var(--c-amber)' }}>Unverified &mdash; check against official manual</span> : sel.last_verified}
        </div>
      )}
    </div>
  )
}
