import type { CompileReport as ReportType, Diagnostic } from '../types'
import { ScoreGauge } from '../components/ScoreGauge'
import { RadarChart } from '../components/RadarChart'
import { DiagnosticCard } from '../components/DiagnosticCard'
import { ChecklistPanel } from '../components/ChecklistPanel'
import { CitationAudit } from '../components/CitationAudit'

interface Props {
  report: ReportType
  styleName: string
}

export function CompileReportPage({ report, styleName }: Props) {
  const ruleDiags = report.diagnostics.filter((d) => d.source === 'rule')
  const llmDiags = report.diagnostics.filter((d) => d.source === 'llm')
  const errors = ruleDiags.filter((d: Diagnostic) => d.severity === 'error')
  const warnings = ruleDiags.filter((d: Diagnostic) => d.severity === 'warning')
  const infos = ruleDiags.filter((d: Diagnostic) => d.severity === 'info')

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compile Report</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Style: <span className="font-medium">{styleName}</span> &bull; Engine v
              {report.engine_version} &bull; Ruleset v{report.ruleset_version}
            </p>
            {report.ruleset_last_verified && (
              <p className="text-xs text-gray-400 mt-0.5">
                Ruleset last verified: {report.ruleset_last_verified}
              </p>
            )}
          </div>
          {report.partial && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-2 text-sm text-amber-700">
              Partial report — some properties could not be measured
            </div>
          )}
        </div>
      </div>

      {/* Score + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Alignment Score</h3>
          <ScoreGauge score={report.score} band={report.score_band} />
          {report.citation_audit.weakest_dimension && (
            <p className="text-xs text-gray-500 mt-3">
              Weakest dimension:{' '}
              <span className="font-semibold">{report.citation_audit.weakest_dimension}</span>
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Per-category scores</h3>
          <RadarChart categoryScores={report.category_scores} />
        </div>
      </div>

      {/* Parse warnings */}
      {report.parse_warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Parse warnings</h3>
          <ul className="space-y-1">
            {report.parse_warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-700">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Include / Omit / Fix checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Include / Omit checklist</h3>
        <ChecklistPanel missing={report.missing_sections} forbidden={report.forbidden_or_empty} />
      </div>

      {/* Citation audit */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Citation audit</h3>
        <CitationAudit
          undefined_={report.citation_audit.undefined}
          unused={report.citation_audit.unused}
        />
      </div>

      {/* Diagnostics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Diagnostics ({errors.length} errors, {warnings.length} warnings, {infos.length} info)
        </h3>
        <div className="space-y-3">
          {errors.map((d, i) => (
            <DiagnosticCard key={`e-${i}`} diag={d} />
          ))}
          {warnings.map((d, i) => (
            <DiagnosticCard key={`w-${i}`} diag={d} />
          ))}
          {infos.map((d, i) => (
            <DiagnosticCard key={`i-${i}`} diag={d} />
          ))}
          {errors.length === 0 && warnings.length === 0 && infos.length === 0 && (
            <p className="text-sm text-green-600">No rule violations detected.</p>
          )}
        </div>
      </div>

      {/* LLM suggestions (separate lane) */}
      {llmDiags.length > 0 && (
        <div className="bg-white rounded-xl border border-purple-200 p-6">
          <h3 className="text-base font-semibold text-purple-800 mb-1">AI Suggestions</h3>
          <p className="text-xs text-purple-600 mb-4">
            These are advisory only and do not affect the alignment score.
          </p>
          <div className="space-y-3">
            {llmDiags.map((d, i) => (
              <DiagnosticCard key={`llm-${i}`} diag={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
