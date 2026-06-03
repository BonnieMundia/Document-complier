interface Props {
  score: number
  band: 'green' | 'amber' | 'red'
}

const BAND_COLORS = {
  green: 'text-green-600 bg-green-100',
  amber: 'text-amber-600 bg-amber-100',
  red: 'text-red-600 bg-red-100',
}

const BAND_LABELS = {
  green: 'Compliant',
  amber: 'Needs work',
  red: 'Non-compliant',
}

export function ScoreGauge({ score, band }: Props) {
  const color = BAND_COLORS[band]
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - score / 100)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={band === 'green' ? '#22c55e' : band === 'amber' ? '#f59e0b' : '#ef4444'}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{score.toFixed(0)}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
        {BAND_LABELS[band]}
      </span>
    </div>
  )
}
