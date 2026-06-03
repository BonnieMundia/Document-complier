import React from 'react'
import { IconError, IconWarning, IconInfo, IconWrench, IconX } from './icons'
import type { Diagnostic } from '../types'

interface Props { diag: Diagnostic; onDismiss?: () => void; dismissed?: boolean }

const SEV_ICON = {
  error: <IconError size={14}/>,
  warning: <IconWarning size={14}/>,
  info: <IconInfo size={14}/>,
}
const SEV_STYLE = { error: 'diag-error', warning: 'diag-warning', info: 'diag-info' }
const SEV_COLOR = { error: 'var(--c-red)', warning: 'var(--c-amber)', info: 'var(--c-blue)' }

export function DiagnosticCard({ diag, onDismiss, dismissed }: Props) {
  if (dismissed) return null
  const cls = diag.source === 'llm' ? 'diag-llm' : SEV_STYLE[diag.severity]
  const color = diag.source === 'llm' ? 'var(--c-purple)' : SEV_COLOR[diag.severity]

  return (
    <div className={`diag-card ${cls}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color, display: 'flex' }}>{SEV_ICON[diag.severity]}</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color, letterSpacing: '0.04em' }}>
          {diag.severity}
        </span>
        {diag.source === 'llm' && (
          <span style={{ fontSize: 10, background: 'var(--c-purple-soft)', color: 'var(--c-purple)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Advisory</span>
        )}
        <span className="mono" style={{ fontSize: 10, color: 'var(--c-text-muted)', marginLeft: 'auto', marginRight: onDismiss ? 4 : 0 }}>
          {diag.rule_id}
        </span>
        {onDismiss && (
          <button onClick={onDismiss} className="btn btn-ghost btn-sm" style={{ padding: '2px 4px', color: 'var(--c-text-muted)' }}>
            <IconX size={12}/>
          </button>
        )}
      </div>

      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: 'var(--c-text)' }}>{diag.message}</p>

      {(diag.found || diag.expected) && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
          {diag.found && (
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
              Found: <code style={{ background: 'var(--c-surface)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--c-border)' }}>{diag.found}</code>
            </span>
          )}
          {diag.expected && (
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
              Expected: <code style={{ background: 'var(--c-surface)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--c-border)' }}>{diag.expected}</code>
            </span>
          )}
        </div>
      )}

      {diag.evidence && (
        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--c-border)', paddingLeft: 8, marginBottom: 8 }}>
          {diag.evidence}
        </div>
      )}

      {diag.fix_hint && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-green)', background: 'var(--c-green-soft)', padding: '5px 10px', borderRadius: 6 }}>
          <IconWrench size={12}/> {diag.fix_hint}
        </div>
      )}

      {(diag.location || diag.spec_reference) && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--c-text-muted)' }}>
          {diag.location && <span>{diag.location}</span>}
          {diag.spec_reference && <a href={diag.spec_reference} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', textDecoration: 'none' }}>Spec reference &rarr;</a>}
        </div>
      )}
    </div>
  )
}
