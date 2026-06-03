import React from 'react'

interface Props { score: number; band: 'green' | 'amber' | 'red' }

const BAND_COLOR = { green: '#059669', amber: '#d97706', red: '#dc2626' }
const BAND_LABEL = { green: 'Excellent', amber: 'Needs work', red: 'Poor match' }

export function ScoreGauge({ score, band }: Props) {
  const color = BAND_COLOR[band]
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--c-border)" strokeWidth="12"/>
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1 }}>{Math.round(score)}</span>
          <span style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 99,
        background: `${color}20`, color, border: `1px solid ${color}40`,
      }}>{BAND_LABEL[band]}</span>
    </div>
  )
}
