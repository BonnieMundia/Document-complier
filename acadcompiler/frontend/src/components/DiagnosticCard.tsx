import type { Diagnostic } from '../types'

interface Props {
  diag: Diagnostic
}

const SEVERITY_STYLES = {
  error: 'border-red-300 bg-red-50',
  warning: 'border-amber-300 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
}

const SEVERITY_BADGE = {
  error: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}

export function DiagnosticCard({ diag }: Props) {
  const style = SEVERITY_STYLES[diag.severity]
  const badge = SEVERITY_BADGE[diag.severity]

  return (
    <div className={`border rounded-lg p-4 ${style} ${diag.source === 'llm' ? 'opacity-80' : ''}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${badge}`}>
          {diag.severity.toUpperCase()}
        </span>
        {diag.source === 'llm' && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            Suggestion (AI)
          </span>
        )}
        <span className="text-xs text-gray-500 font-mono ml-auto">{diag.rule_id}</span>
      </div>

      <p className="text-sm font-medium text-gray-800 mb-2">{diag.message}</p>

      {(diag.found || diag.expected) && (
        <div className="text-xs text-gray-600 space-y-1 mb-2">
          {diag.found && (
            <div>
              <span className="font-medium">Found:</span>{' '}
              <code className="bg-white px-1 rounded">{diag.found}</code>
            </div>
          )}
          {diag.expected && (
            <div>
              <span className="font-medium">Expected:</span>{' '}
              <code className="bg-white px-1 rounded">{diag.expected}</code>
            </div>
          )}
        </div>
      )}

      {diag.evidence && (
        <div className="text-xs text-gray-500 italic mb-2 border-l-2 border-gray-300 pl-2">
          Evidence: {diag.evidence}
        </div>
      )}

      {diag.fix_hint && (
        <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mb-1">
          Fix: {diag.fix_hint}
        </div>
      )}

      <div className="flex items-center gap-3 mt-2">
        {diag.location && <span className="text-xs text-gray-400">{diag.location}</span>}
        {diag.spec_reference && (
          <a
            href={diag.spec_reference}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Spec reference
          </a>
        )}
      </div>
    </div>
  )
}
