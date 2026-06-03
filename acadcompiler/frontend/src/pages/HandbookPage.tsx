import React, { useEffect, useState } from 'react'
import { fetchHandbookStyles, fetchHandbookStyle, downloadHandbookTemplate, downloadHandbookSample } from '../hooks/useApi'
import { IconDownload, IconLink, IconSpinner, IconChevronRight } from '../components/icons'
import type { HandbookStyleSummary, HandbookStyleDetail } from '../types'

type NoteTab = 'overview' | 'formatting' | 'citations' | 'mistakes'

const NOTE_TABS: { id: NoteTab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'formatting', label: 'Formatting' },
  { id: 'citations',  label: 'Citations' },
  { id: 'mistakes',   label: 'Common Mistakes' },
]

function SourceBadge({ source }: { source: string; url?: string }) {
  if (source === 'uploaded') {
    return (
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
        background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>Official template</span>
    )
  }
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>Internet source</span>
  )
}

function NoteField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.6 }}>{value}</div>
    </div>
  )
}

function BulletList({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.5 }}>
          <span style={{ color: color || 'var(--c-red)', flexShrink: 0, fontWeight: 700, fontSize: 14, marginTop: -1 }}>·</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function SampleCard({ styleId, sample, color }: { styleId: string; sample: any; color: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const blob = await downloadHandbookSample(styleId, sample.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = sample.filename; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) { alert('Download failed: ' + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      border: '1px solid var(--c-border)', borderRadius: 10, padding: 16,
      background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Paper icon */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 44, borderRadius: 4, flexShrink: 0,
          background: `${color}15`, border: `1.5px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <rect x="1.5" y="1.5" width="13" height="17" rx="1.5" stroke={color} strokeWidth="1.3"/>
            <path d="M4 6h8M4 9h8M4 12h5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', lineHeight: 1.4, marginBottom: 3 }}>
            {sample.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.4 }}>
            {sample.description}
          </div>
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="btn btn-secondary btn-sm"
        style={{ marginTop: 4, justifyContent: 'center' }}
      >
        {loading ? <><IconSpinner size={13}/> Downloading…</> : <><IconDownload size={13}/> Download .docx</>}
      </button>
    </div>
  )
}

function StyleDetail({ style }: { style: HandbookStyleDetail }) {
  const [noteTab, setNoteTab] = useState<NoteTab>('overview')
  const [dlLoading, setDlLoading] = useState(false)
  const n = style.notes

  async function handleTemplateDownload() {
    if (style.template_source === 'internet') {
      window.open(style.template_url, '_blank')
      return
    }
    setDlLoading(true)
    try {
      const blob = await downloadHandbookTemplate(style.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = style.template_file || `${style.id}_template`; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) { alert('Download failed: ' + e.message) }
    finally { setDlLoading(false) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        background: `linear-gradient(135deg, ${style.color}10 0%, ${style.color}05 100%)`,
        border: `1px solid ${style.color}25`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: style.color, flexShrink: 0,
              }}/>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--c-text)' }}>{style.name}</h2>
              <SourceBadge source={style.template_source} url={style.template_url}/>
            </div>
            <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 4 }}>{style.full_name}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}><strong>Authority:</strong> {style.authority}</span>
              <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}><strong>Edition:</strong> {style.edition}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-text-muted)' }}>
              <strong>Disciplines:</strong> {style.discipline}
            </div>
          </div>
          <button
            onClick={handleTemplateDownload}
            disabled={dlLoading}
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0 }}
          >
            {dlLoading ? (
              <><IconSpinner size={13}/> Downloading…</>
            ) : style.template_source === 'internet' ? (
              <><IconLink size={13}/> View official template</>
            ) : (
              <><IconDownload size={13}/> Download official template</>
            )}
          </button>
        </div>
      </div>

      {/* Note tabs */}
      <div className="card" style={{ padding: 0, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--c-border)',
          background: 'var(--c-surface)',
        }}>
          {NOTE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setNoteTab(tab.id)}
              style={{
                padding: '11px 18px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                background: noteTab === tab.id ? 'var(--c-bg)' : 'transparent',
                color: noteTab === tab.id ? style.color : 'var(--c-text-muted)',
                borderBottom: noteTab === tab.id ? `2px solid ${style.color}` : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>
          {noteTab === 'overview' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.7, margin: '0 0 16px' }}>{n.overview}</p>
              {n.key_changes_from_6th && (
                <div style={{ background: 'var(--c-primary-soft)', border: '1px solid var(--c-primary-dim)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Key changes from previous edition</div>
                  <BulletList items={n.key_changes_from_6th} color="var(--c-primary)"/>
                </div>
              )}
              {n.special_notes && (
                <div style={{ marginTop: 16, background: 'var(--c-amber-soft)', border: '1px solid var(--c-amber-dim)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Important notes</div>
                  <BulletList items={n.special_notes} color="var(--c-amber)"/>
                </div>
              )}
            </div>
          )}

          {noteTab === 'formatting' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {n.page_setup && <NoteField label="Page setup" value={n.page_setup}/>}
              {n.font && <NoteField label="Font" value={n.font}/>}
              {n.spacing && <NoteField label="Line spacing" value={n.spacing}/>}
              {n.headings && <NoteField label="Headings" value={n.headings}/>}
              {n.title_page && <NoteField label="Title page" value={n.title_page}/>}
              {n.abstract && <NoteField label="Abstract" value={n.abstract}/>}
              {n.figures && <NoteField label="Figures & tables" value={n.figures}/>}
            </div>
          )}

          {noteTab === 'citations' && (
            <div>
              {n.citations && <NoteField label="In-text citations" value={n.citations}/>}
              {n.references && <NoteField label="Reference list / bibliography" value={n.references}/>}
              {(n as any).footnotes && <NoteField label="Footnotes" value={(n as any).footnotes}/>}
              {n.cases && <NoteField label="Cases" value={n.cases}/>}
              {n.legislation && <NoteField label="Legislation" value={n.legislation}/>}
              {n.secondary && <NoteField label="Books & articles" value={n.secondary}/>}
            </div>
          )}

          {noteTab === 'mistakes' && (
            <div>
              {n.common_mistakes && n.common_mistakes.length > 0 ? (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 12 }}>
                    Common errors that cause marks or desk rejections:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {n.common_mistakes.map((mistake, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 10, padding: '10px 14px',
                        background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)',
                        borderRadius: 8, fontSize: 13, color: 'var(--c-text-2)',
                        borderLeft: '3px solid var(--c-red)',
                      }}>
                        <span style={{ color: 'var(--c-red)', fontWeight: 700, flexShrink: 0, fontSize: 11, marginTop: 2 }}>✗</span>
                        {mistake}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>No specific common mistakes documented for this style.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sample papers */}
      {style.samples && style.samples.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Sample papers</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {style.samples.map(sample => (
              <SampleCard key={sample.id} styleId={style.id} sample={sample} color={style.color}/>
            ))}
          </div>
        </div>
      )}

      {!style.samples && (
        <div style={{
          border: '1px dashed var(--c-border)', borderRadius: 10, padding: 20,
          textAlign: 'center', color: 'var(--c-text-muted)', fontSize: 13,
        }}>
          Sample papers for this style are not yet included. The official template link above contains annotated examples.
        </div>
      )}
    </div>
  )
}

export function HandbookPage() {
  const [styles, setStyles] = useState<HandbookStyleSummary[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<HandbookStyleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHandbookStyles()
      .then(data => { setStyles(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!selected) return
    setDetailLoading(true)
    setDetail(null)
    fetchHandbookStyle(selected)
      .then(d => { setDetail(d); setDetailLoading(false) })
      .catch(e => { setError(e.message); setDetailLoading(false) })
  }, [selected])

  const filtered = styles.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.authority.toLowerCase().includes(search.toLowerCase()) ||
    s.discipline.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--c-text)' }}>Style Handbook</h1>
        <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: '4px 0 0' }}>
          Official templates, detailed formatting rules, and downloadable sample papers for {styles.length} citation styles
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '288px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Style list panel */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 20 }}>
          {/* Search */}
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--c-border)' }}>
            <input
              className="input"
              placeholder="Search styles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', fontSize: 12 }}
            />
          </div>

          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-text-muted)', fontSize: 13 }}>
              <IconSpinner size={18}/>
            </div>
          )}

          {!loading && (
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
              {filtered.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'stretch', gap: 0,
                    background: selected === s.id ? `${s.color}08` : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--c-border-soft)',
                    cursor: 'pointer', padding: 0, textAlign: 'left',
                    outline: selected === s.id ? `1.5px solid ${s.color}40` : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Color bar */}
                  <div style={{ width: 4, background: s.color, flexShrink: 0, borderRadius: '0 0 0 0' }}/>
                  <div style={{ padding: '12px 12px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: selected === s.id ? s.color : 'var(--c-text)',
                        lineHeight: 1.3,
                      }}>{s.name}</span>
                      {s.has_samples && (
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 10, flexShrink: 0,
                          background: `${s.color}15`, color: s.color, fontWeight: 600,
                        }}>{s.sample_count}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2, lineHeight: 1.3 }}>{s.authority}</div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginTop: 3, opacity: 0.7 }}>{s.discipline.split(',')[0]}{s.discipline.includes(',') ? '…' : ''}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                      {s.has_template_file && (
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: '#d1fae5', color: '#065f46', fontWeight: 600, letterSpacing: '0.04em' }}>TEMPLATE</span>
                      )}
                      {s.has_samples && (
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: '#dbeafe', color: '#1e40af', fontWeight: 600, letterSpacing: '0.04em' }}>SAMPLES</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8, color: 'var(--c-text-muted)' }}>
                    <IconChevronRight size={12}/>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {!selected && !loading && (
            <div style={{
              border: '1.5px dashed var(--c-border)', borderRadius: 12,
              padding: '60px 40px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.25, margin: '0 auto', display: 'block' }}>
                  <rect x="6" y="4" width="28" height="38" rx="3" stroke="var(--c-text)" strokeWidth="2.5"/>
                  <path d="M12 14h16M12 20h16M12 26h10" stroke="var(--c-text)" strokeWidth="2.2" strokeLinecap="round"/>
                  <path d="M34 10v34l8-6V4l-8 6z" stroke="var(--c-text)" strokeWidth="2.2" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text)', marginBottom: 6 }}>Select a citation style</div>
              <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
                Choose a style from the list to view official templates,<br/>detailed notes, and downloadable sample papers.
              </div>
            </div>
          )}

          {detailLoading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text-muted)' }}>
              <IconSpinner size={24}/>
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--c-red)' }}>{error}</div>
          )}

          {detail && !detailLoading && (
            <StyleDetail style={detail}/>
          )}
        </div>
      </div>
    </div>
  )
}
