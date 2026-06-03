import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { uploadDocument, fetchStyles, compileDocument } from '../hooks/useApi'
import { UploadZone } from '../components/UploadZone'
import { StylePicker } from '../components/StylePicker'
import { CompileReportPage } from './CompileReport'

export function Home() {
  const {
    uploadResult, selectedStyle, report, styles, loading, error,
    setUploadResult, setSelectedStyle, setReport, setStyles, setLoading, setError,
  } = useAppStore()

  useEffect(() => {
    fetchStyles()
      .then(setStyles)
      .catch(() => setError('Failed to load styles'))
  }, [setStyles, setError])

  async function handleFile(file: File) {
    setError(null)
    setReport(null)
    setLoading(true)
    try {
      const result = await uploadDocument(file)
      setUploadResult(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCompile() {
    if (!uploadResult) return
    setError(null)
    setLoading(true)
    try {
      const r = await compileDocument(uploadResult.doc_id, selectedStyle)
      setReport(r)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Compile failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedStyleName = styles.find((s) => s.id === selectedStyle)?.name ?? selectedStyle

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">AcadCompiler</h1>
            <p className="text-xs text-gray-500">Academic paper style checker — deterministic diagnostics</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Upload + style picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <UploadZone onFile={handleFile} disabled={loading} />

          {uploadResult && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <span>✓</span>
              <span>
                Uploaded <strong>{uploadResult.filename}</strong> ({uploadResult.size_mb.toFixed(2)} MB)
              </span>
            </div>
          )}

          {styles.length > 0 && (
            <StylePicker styles={styles} selected={selectedStyle} onChange={setSelectedStyle} />
          )}

          {uploadResult && (
            <button
              onClick={handleCompile}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Compiling…' : 'Compile paper →'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {report && <CompileReportPage report={report} styleName={selectedStyleName} />}
      </main>
    </div>
  )
}
