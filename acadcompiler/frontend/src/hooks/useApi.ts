import axios from 'axios'
import type { CompileReport, StyleSummary, UploadResponse } from '../types'

const BASE = '/api'

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post(`${BASE}/upload/`, form)
  return data
}

export async function fetchStyles(): Promise<StyleSummary[]> {
  const { data } = await axios.get(`${BASE}/styles/`)
  return data
}

export async function compileDocument(docId: string, styleId: string): Promise<CompileReport> {
  const { data } = await axios.post(`${BASE}/compile/${docId}?style=${styleId}`)
  return data
}
