'use client'

const LABELS: Record<number, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent',
}

function pillClass(score: number, isSelected: boolean): string {
  if (!isSelected)
    return 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
  if (score >= 4) return 'border-green-400 bg-green-50 text-green-700'
  if (score === 3) return 'border-amber-400 bg-amber-50 text-amber-700'
  return 'border-red-400 bg-red-50 text-red-600'
}

interface ScoreSelectorProps {
  name: string
  label: string
  value: number | null
  onChange: (val: number) => void
  error?: string
}

export function ScoreSelector({ name, label, value, onChange, error }: ScoreSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} — ${LABELS[n]}`}
            className={`h-10 w-10 rounded-full border-2 text-sm font-bold transition-all ${pillClass(n, value === n)}`}
          >
            {n}
          </button>
        ))}
        {value !== null && value > 0 && (
          <span className="ml-1 text-xs text-slate-400">{LABELS[value]}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input type="hidden" name={name} value={value ?? ''} />
    </div>
  )
}
