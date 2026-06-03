import React from 'react'
import { IconError, IconCheck } from './icons'

interface Props { missing: string[]; forbidden: string[] }

function IconWarning({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 2L14.5 13H1.5L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}

export function ChecklistPanel({ missing, forbidden }: Props) {
  if (missing.length === 0 && forbidden.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c-green)', fontSize: 13 }}><IconCheck size={16}/> All required sections present</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {missing.map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-red)' }}>
          <IconError size={14}/> <code style={{ background: 'var(--c-red-soft)', padding: '1px 6px', borderRadius: 4 }}>{s}</code> required but not found
        </div>
      ))}
      {forbidden.map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-amber)' }}>
          <IconWarning size={14}/> <code style={{ background: 'var(--c-amber-soft)', padding: '1px 6px', borderRadius: 4 }}>{s}</code> should be omitted
        </div>
      ))}
    </div>
  )
}
