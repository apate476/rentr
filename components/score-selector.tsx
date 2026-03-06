'use client'

const LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
}

interface ScoreSelectorProps {
  name: string
  label: string
  emoji: string
  value: number | null
  onChange: (val: number) => void
  error?: string
}

export function ScoreSelector({ name, label, emoji, value, onChange, error }: ScoreSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {emoji} {label}
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
              value === n
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:border-primary/50 hover:bg-primary/5'
            }`}
            aria-label={`${n} — ${LABELS[n]}`}
          >
            {n}
          </button>
        ))}
        {value && (
          <span className="text-muted-foreground self-center text-xs">{LABELS[value]}</span>
        )}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <input type="hidden" name={name} value={value ?? ''} />
    </div>
  )
}
