import { create } from 'zustand'
import type { CompileReport, StyleSummary, UploadResponse } from '../types'

interface AppState {
  uploadResult: UploadResponse | null
  selectedStyle: string
  report: CompileReport | null
  styles: StyleSummary[]
  loading: boolean
  error: string | null
  setUploadResult: (r: UploadResponse | null) => void
  setSelectedStyle: (s: string) => void
  setReport: (r: CompileReport | null) => void
  setStyles: (s: StyleSummary[]) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  uploadResult: null,
  selectedStyle: 'apa7',
  report: null,
  styles: [],
  loading: false,
  error: null,
  setUploadResult: (uploadResult) => set({ uploadResult }),
  setSelectedStyle: (selectedStyle) => set({ selectedStyle }),
  setReport: (report) => set({ report }),
  setStyles: (styles) => set({ styles }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
