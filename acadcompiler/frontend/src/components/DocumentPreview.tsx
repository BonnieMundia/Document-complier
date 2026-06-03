import React from 'react'
import type { Diagnostic, DocBlock } from '../types'

interface Props {
  blocks: DocBlock[]
  diagnostics: Diagnostic[]
}

function renderWithHighlight(text: string, needle?: string | null): React.ReactNode {
  if (!needle || needle.length < 4) return text
  const idx = text.toLowerCase().indexOf(needle.toLowerCase())
  if (idx < 0) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#fef08a', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  )
}

const SEV_COLOR: Record<string, string> = {
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
}
const SEV_BG: Record<string, string> = {
  error: '#fef2f2',
  warning: '#fffbeb',
  info: '#eff6ff',
}

function BlockEl({ block, highlight }: { block: DocBlock; highlight?: string | null }) {
  const hasIssue = !!highlight
  const { kind, level, text, bold, italic, alignment } = block

  const base: React.CSSProperties = {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 13,
    lineHeight: 1.9,
    color: '#111',
    background: hasIssue ? '#fff9f9' : '#fff',
    padding: '6px 36px',
    borderLeft: hasIssue ? '3px solid #ef4444' : '3px solid transparent',
  }

  const rendered = renderWithHighlight(text, highlight)

  if (kind === 'title') {
    return (
      <div style={{ ...base, textAlign: 'center', fontSize: 17, fontWeight: 700, padding: '14px 36px 8px' }}>
        {rendered}
      </div>
    )
  }
  if (kind === 'author') {
    return <div style={{ ...base, textAlign: 'center', fontStyle: 'italic' }}>{rendered}</div>
  }
  if (kind === 'abstract') {
    return (
      <div style={{ ...base, margin: '0 32px', padding: '8px 16px' }}>
        <span style={{ fontWeight: 700 }}>Abstract. </span>
        {rendered}
      </div>
    )
  }
  if (kind === 'keywords') {
    return (
      <div style={{ ...base }}>
        <span style={{ fontWeight: 700 }}>Keywords: </span>
        <span style={{ fontStyle: 'italic' }}>{rendered}</span>
      </div>
    )
  }
  if (kind === 'heading') {
    const sizes = [18, 15, 13, 12]
    const sz = sizes[Math.min((level ?? 1) - 1, 3)]
    return (
      <div style={{ ...base, fontSize: sz, fontWeight: 700, padding: '14px 36px 4px' }}>
        {rendered}
      </div>
    )
  }
  if (kind === 'reference') {
    return (
      <div style={{ ...base, textIndent: '-2em', paddingLeft: 'calc(36px + 2em)' }}>
        {rendered}
      </div>
    )
  }
  if (kind === 'footnote') {
    return (
      <div style={{ ...base, fontSize: 11, borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
        {rendered}
      </div>
    )
  }
  if (kind === 'caption') {
    return (
      <div style={{ ...base, textAlign: 'center', fontStyle: 'italic', fontSize: 11 }}>
        {rendered}
      </div>
    )
  }

  return (
    <div style={{
      ...base,
      textIndent: kind === 'body' ? '2em' : 0,
      fontWeight: bold ? 700 : undefined,
      fontStyle: italic ? 'italic' : undefined,
      textAlign: alignment === 'center' ? 'center'
        : alignment === 'right' ? 'right'
        : alignment === 'justify' ? 'justify'
        : undefined,
    }}>
      {rendered}
    </div>
  )
}

function CalloutCard({ diag }: { diag: Diagnostic }) {
  const color = SEV_COLOR[diag.severity] ?? '#94a3b8'
  const bg = SEV_BG[diag.severity] ?? '#f8fafc'
  const needle = diag.evidence || diag.found
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 7 }}>
      <div style={{
        width: 0, height: 0, flexShrink: 0, marginTop: 13,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: `7px solid ${color}`,
      }}/>
      <div style={{
        flex: 1,
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: 6,
        padding: '8px 10px',
        fontSize: 11,
        lineHeight: 1.5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{
            background: color, color: '#fff', borderRadius: 3,
            padding: '1px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          }}>
            {diag.severity}
          </span>
          <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 10 }}>
            {diag.rule_id}
          </span>
        </div>
        <div style={{ color: '#111', fontWeight: 600, marginBottom: 4 }}>{diag.message}</div>
        {needle && needle.length < 120 && (
          <div style={{ color: '#6b7280', fontSize: 10, fontStyle: 'italic', marginBottom: diag.fix_hint ? 4 : 0 }}>
            Found: &ldquo;{needle.length > 70 ? needle.slice(0, 70) + '…' : needle}&rdquo;
          </div>
        )}
        {diag.expected && (
          <div style={{ color: '#059669', fontSize: 10, marginBottom: diag.fix_hint ? 4 : 0 }}>
            Expected: {diag.expected}
          </div>
        )}
        {diag.fix_hint && (
          <div style={{ color: '#2563eb', fontSize: 10, borderTop: '1px solid #dbeafe', paddingTop: 4, marginTop: 4 }}>
            Fix: {diag.fix_hint}
          </div>
        )}
      </div>
    </div>
  )
}

export function DocumentPreview({ blocks, diagnostics }: Props) {
  const byBlock = new Map<number | null, Diagnostic[]>()
  for (const d of diagnostics) {
    const key = d.block_index ?? null
    if (!byBlock.has(key)) byBlock.set(key, [])
    byBlock.get(key)!.push(d)
  }

  const globalDiags = byBlock.get(null) ?? []
  const errorCount = diagnostics.filter(d => d.severity === 'error').length
  const warnCount = diagnostics.filter(d => d.severity === 'warning').length
  const infoCount = diagnostics.filter(d => d.severity === 'info').length

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Left sticky sidebar */}
      <div style={{ width: 210, flexShrink: 0, position: 'sticky', top: 16 }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
            Document-level issues
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            <span style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
            <span style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
              {warnCount} warning{warnCount !== 1 ? 's' : ''}
            </span>
            {infoCount > 0 && (
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>
                {infoCount} info
              </span>
            )}
          </div>
          {globalDiags.length === 0 ? (
            <div style={{ fontSize: 11, color: '#9ca3af' }}>No document-level issues</div>
          ) : (
            globalDiags.map((d, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${SEV_COLOR[d.severity] ?? '#94a3b8'}`, paddingLeft: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: SEV_COLOR[d.severity], fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
                  {d.severity}
                </div>
                <div style={{ fontSize: 11, color: '#374151', fontWeight: 600, marginBottom: d.fix_hint ? 3 : 0 }}>{d.message}</div>
                {d.fix_hint && <div style={{ fontSize: 10, color: '#6b7280' }}>{d.fix_hint}</div>}
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, fontSize: 11 }}>
          <div style={{ fontWeight: 700, color: '#374151', marginBottom: 8 }}>Legend</div>
          {(['error', 'warning', 'info'] as const).map(sev => (
            <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <div style={{ width: 11, height: 11, borderRadius: 3, background: SEV_COLOR[sev], flexShrink: 0 }}/>
              <span style={{ color: '#374151', textTransform: 'capitalize' }}>{sev}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
            <mark style={{ background: '#fef08a', borderRadius: 2, padding: '0 4px', fontSize: 11 }}>text</mark>
            <span style={{ color: '#374151' }}>= where to fix</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
            <div style={{ width: 11, height: 11, borderRadius: 0, borderLeft: '3px solid #ef4444', flexShrink: 0 }}/>
            <span style={{ color: '#374151' }}>block has issue</span>
          </div>
        </div>
      </div>

      {/* Center document + Right callouts: 2-column grid per block row */}
      <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, alignItems: 'start' }}>
        {blocks.map(block => {
          const blockDiags = byBlock.get(block.index) ?? []
          const needle = blockDiags.length > 0
            ? (blockDiags[0].evidence || blockDiags[0].found || null)
            : null

          return (
            <React.Fragment key={block.index}>
              {/* Center: document block */}
              <div style={{
                background: '#fff',
                boxShadow: 'inset -1px 0 0 #f1f5f9',
              }}>
                <BlockEl block={block} highlight={needle}/>
              </div>

              {/* Right: callout cards for this block */}
              <div style={{ padding: '4px 0 4px 14px', alignSelf: 'center' }}>
                {blockDiags.map((d, i) => (
                  <CalloutCard key={i} diag={d}/>
                ))}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
