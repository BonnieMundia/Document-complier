interface Props {
  missing: string[]
  forbidden: string[]
}

export function ChecklistPanel({ missing, forbidden }: Props) {
  return (
    <div className="space-y-4">
      {missing.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            Include — Missing required sections
          </h3>
          <ul className="space-y-1">
            {missing.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-red-600">
                <span className="text-red-400">✗</span>
                <code>{s}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {forbidden.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-700 mb-2">Omit — Forbidden sections</h3>
          <ul className="space-y-1">
            {forbidden.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-amber-600">
                <span className="text-amber-400">⚠</span>
                <code>{s}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {missing.length === 0 && forbidden.length === 0 && (
        <p className="text-sm text-green-600">All required sections present.</p>
      )}
    </div>
  )
}
