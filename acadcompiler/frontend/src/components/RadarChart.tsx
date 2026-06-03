import {
  RadarChart as ReRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface Props {
  categoryScores: Record<string, number>
}

export function RadarChart({ categoryScores }: Props) {
  const data = Object.entries(categoryScores).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
        <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Score']} />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
