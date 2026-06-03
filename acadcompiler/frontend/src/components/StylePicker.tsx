import type { StyleSummary } from '../types'

interface Props {
  styles: StyleSummary[]
  selected: string
  onChange: (id: string) => void
}

export function StylePicker({ styles, selected, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Target style</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {styles.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} {s.edition ? `(${s.edition})` : ''} — {s.authority}
          </option>
        ))}
      </select>
    </div>
  )
}
