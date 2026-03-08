'use client'

import { useRouter } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'overall', label: 'Best overall' },
  { value: 'count', label: 'Most reviewed' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
]

interface SearchSortBarProps {
  q?: string
  city?: string
  currentSort: string
}

export function SearchSortBar({ q, city, currentSort }: SearchSortBarProps) {
  const router = useRouter()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (city) params.set('city', city)
    if (value !== 'overall') params.set('sort', value)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Sort by</span>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="focus:ring-primary/20 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:ring-2 focus:outline-none"
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
