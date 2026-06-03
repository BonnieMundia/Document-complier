import React from 'react'

interface Props { categoryScores: Record<string, number> }

function barColor(score: number) {
  if (score >= 90) return '#059669'
  if (score >= 70) return '#d97706'
  return '#dc2626'
}

export function RadarChart({ categoryScores }: Props) {
  const entries = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(([cat, score]) => (
        <div key={cat}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: 'var(--c-text-2)', textTransform: 'capitalize' }}>{cat}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: barColor(score) }}>{Math.round(score)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${score}%`, background: barColor(score) }}/>
          </div>
        </div>
      ))}
    </div>
  )
}
