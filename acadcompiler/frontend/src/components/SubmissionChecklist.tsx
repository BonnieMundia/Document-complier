import React, { useState } from 'react'
import { IconCheck, IconError, IconInfo } from './icons'
import type { SubmissionChecklist as SType } from '../types'

interface Props { checklist: SType }

export function SubmissionChecklist({ checklist }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>Submission Readiness</span>
        <span style={{ fontSize: 12, color: checklist.ready ? 'var(--c-green)' : 'var(--c-amber)', background: checklist.ready ? 'var(--c-green-soft)' : 'var(--c-amber-soft)', padding: '2px 8px', borderRadius: 99 }}>
          {checklist.pass_count}/{checklist.items.length} pass
        </span>
        <span style={{ fontSize: 12, color: 'var(--c-text-muted)', marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {checklist.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              {item.status === 'pass' && <span style={{ color: 'var(--c-green)' }}><IconCheck size={14}/></span>}
              {item.status === 'fail' && <span style={{ color: 'var(--c-red)' }}><IconError size={14}/></span>}
              {item.status === 'unknown' && <span style={{ color: 'var(--c-text-muted)' }}><IconInfo size={14}/></span>}
              <span style={{ color: item.status === 'fail' ? 'var(--c-red)' : item.status === 'unknown' ? 'var(--c-text-muted)' : 'var(--c-text)' }}>
                {item.label}
              </span>
              {item.detail && <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>&mdash; {item.detail}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
