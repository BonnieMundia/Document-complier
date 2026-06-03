const BASE = 'http://localhost:8000'

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch(`${BASE}${path}`, opts)
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }))
    throw new Error(err.detail || r.statusText)
  }
  return r.json()
}

export async function fetchStyles() {
  return req<any[]>('/styles/')
}

export async function uploadDocument(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return req<any>('/upload/', { method: 'POST', body: fd })
}

export async function compileDocument(docId: string, style: string) {
  return req<any>(`/compile/${docId}?style=${style}`, { method: 'POST' })
}

export async function multiCompile(docId: string, styles: string[]) {
  return req<any>(`/compile/${docId}/multi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ styles }),
  })
}

export async function batchCompile(docIds: string[], style: string) {
  return req<any>('/batch/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_ids: docIds, style }),
  })
}

export async function formatCitation(raw: string, style: string, doi?: string) {
  return req<any>('/citations/format', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw, style, doi }),
  })
}

export async function importBibtex(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return req<any>('/citations/bibtex', { method: 'POST', body: fd })
}

export async function getShareLink(docId: string, style: string) {
  return req<any>(`/reports/${docId}/share?style=${style}`, { method: 'POST' })
}

export async function getHistory(docId: string) {
  return req<any>(`/reports/${docId}/history`)
}

export async function getChecklist(docId: string, style: string) {
  return req<any>(`/reports/${docId}/checklist?style=${style}`)
}

export async function getBlindReview(docId: string) {
  return req<any>(`/blind-review/${docId}`)
}

export async function downloadFixed(docId: string, style: string): Promise<Blob> {
  const r = await fetch(`${BASE}/format/${docId}?style=${style}`, { method: 'POST' })
  if (!r.ok) throw new Error('Auto-fix failed')
  return r.blob()
}

export async function downloadGraderPdf(docId: string, style: string): Promise<Blob> {
  const r = await fetch(`${BASE}/reports/${docId}/grader-pdf?style=${style}`, { method: 'POST' })
  if (!r.ok) throw new Error('PDF export failed')
  return r.blob()
}

export async function fetchHandbookStyles() {
  return req<any[]>('/templates/')
}

export async function fetchHandbookStyle(styleId: string) {
  return req<any>(`/templates/${styleId}`)
}

export async function downloadHandbookTemplate(styleId: string): Promise<Blob> {
  const r = await fetch(`${BASE}/templates/${styleId}/template-file`)
  if (!r.ok) throw new Error('Template download failed')
  return r.blob()
}

export async function downloadHandbookSample(styleId: string, sampleId: string): Promise<Blob> {
  const r = await fetch(`${BASE}/templates/${styleId}/samples/${sampleId}`)
  if (!r.ok) throw new Error('Sample download failed')
  return r.blob()
}
