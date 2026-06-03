interface AuditEntry {
  key: string
  citation?: string
  reference?: string
}

interface Props {
  undefined_: AuditEntry[]
  unused: AuditEntry[]
}

export function CitationAudit({ undefined_, unused }: Props) {
  return (
    <div className="space-y-4">
      {undefined_.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            Undefined citations — cited but not in reference list
          </h3>
          <div className="space-y-1">
            {undefined_.map((u, i) => (
              <div key={i} className="text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
                <code>{u.citation}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {unused.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-700 mb-2">
            Unused references — in list but never cited
          </h3>
          <div className="space-y-1">
            {unused.map((u, i) => (
              <div key={i} className="text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2">
                <code>{u.reference}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {undefined_.length === 0 && unused.length === 0 && (
        <p className="text-sm text-green-600">Citation audit clean — all citations matched.</p>
      )}
    </div>
  )
}
