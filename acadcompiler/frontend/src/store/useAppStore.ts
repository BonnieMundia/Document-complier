import { create } from 'zustand'
import type { CompileReport, StyleSummary, UploadResponse, HistoryEntry, BatchResult } from '../types'

const LS_KEY = 'acadcompiler_history'
const LS_DISMISSED = 'acadcompiler_dismissed'

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveHistory(h: HistoryEntry[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(h.slice(0, 20))) } catch {}
}
function loadDismissed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_DISMISSED) || '[]')) } catch { return new Set() }
}
function saveDismissed(s: Set<string>) {
  try { localStorage.setItem(LS_DISMISSED, JSON.stringify([...s])) } catch {}
}

interface AppState {
  uploadResult: UploadResponse | null
  selectedStyle: string
  report: CompileReport | null
  styles: StyleSummary[]
  loading: boolean
  error: string | null
  compileHistory: HistoryEntry[]
  dismissedRuleIds: Set<string>
  batchResults: BatchResult | null
  compareResults: Record<string, { score: number; band: string; top_3_issues: string[] }> | null
  shareToken: string | null
  activeTab: string

  setUploadResult: (r: UploadResponse | null) => void
  setSelectedStyle: (s: string) => void
  setReport: (r: CompileReport | null) => void
  setStyles: (s: StyleSummary[]) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  addToHistory: (e: HistoryEntry) => void
  dismissDiagnostic: (id: string) => void
  setBatchResults: (r: BatchResult | null) => void
  setCompareResults: (r: any) => void
  setShareToken: (t: string | null) => void
  setActiveTab: (t: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  uploadResult: null,
  selectedStyle: 'apa7',
  report: null,
  styles: [],
  loading: false,
  error: null,
  compileHistory: loadHistory(),
  dismissedRuleIds: loadDismissed(),
  batchResults: null,
  compareResults: null,
  shareToken: null,
  activeTab: 'compiler',

  setUploadResult: (uploadResult) => set({ uploadResult }),
  setSelectedStyle: (selectedStyle) => set({ selectedStyle }),
  setReport: (report) => set({ report }),
  setStyles: (styles) => set({ styles }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addToHistory: (entry) => {
    const h = [entry, ...get().compileHistory].slice(0, 20)
    saveHistory(h)
    set({ compileHistory: h })
  },
  dismissDiagnostic: (id) => {
    const s = new Set(get().dismissedRuleIds)
    s.add(id)
    saveDismissed(s)
    set({ dismissedRuleIds: s })
  },
  setBatchResults: (batchResults) => set({ batchResults }),
  setCompareResults: (compareResults) => set({ compareResults }),
  setShareToken: (shareToken) => set({ shareToken }),
  setActiveTab: (activeTab) => set({ activeTab }),
}))
