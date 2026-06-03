import React from 'react'
import { IconWrench } from './icons'

interface TriageItem { rule_id: string; message: string; score_impact: number; fix_hint?: string; projected_after?: number }
interface Props { triage: TriageItem[]; currentScore: number }

export function TriageBox({ triage, currentScore }: Props) {
  if (!triage || triage.length === 0) return null
  const top = triage.slice(0, 3)
  const gain = top.reduce((s, t) => s + t.score_impact, 0)
  const projected = Math.min(100, currentScore + gain)

  return (
    <div className="triage-box" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <IconWrench size={16}/>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary)' }}>Score roadmap</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--c-text-muted)' }}>
          Fix top {top.length} &rarr; <strong style={{ color: 'var(--c-primary)' }}>{Math.round(currentScore)}% &rarr; {Math.round(projected)}%</strong>
          {projected >= 90 && <span style={{ color: 'var(--c-green)', marginLeft: 4 }}>green</span>}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-primary)', background: 'var(--c-primary-soft)', padding: '2px 7px', borderRadius: 4, marginTop: 1, whiteSpace: 'nowrap' }}>
              +{item.score_impact.toFixed(0)}pts
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.4 }}>{item.message}</div>
              {item.fix_hint && <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>{item.fix_hint}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
