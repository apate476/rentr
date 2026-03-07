import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

function scoreBadgeClass(score: number | null): string {
  if (!score) return 'bg-slate-100 text-slate-400'
  if (score >= 4) return 'bg-green-50 text-green-700'
  if (score >= 3) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

export function PropertyCard({ property }: { property: Property }) {
  const { id, address, city, state, avg_overall, review_count, property_type } = property

  return (
    <Link
      href={`/property/${id}`}
      className="flex items-center justify-between rounded-xl border border-warm-border bg-warm-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-warm-text">{address}</p>
        <p className="mt-0.5 flex items-center gap-2 text-sm text-warm-muted">
          {city}, {state}
          {property_type && (
            <span className="rounded-full border border-warm-border px-2 py-0.5 text-xs capitalize text-warm-muted">
              {property_type}
            </span>
          )}
        </p>
      </div>

      <div className="ml-4 shrink-0 flex flex-col items-end gap-1">
        <span
          className={`rounded-full px-3 py-1 text-base font-bold ${scoreBadgeClass(avg_overall)}`}
        >
          {avg_overall ? avg_overall.toFixed(1) : '—'}
        </span>
        <p className="text-xs text-warm-muted">
          {review_count} {review_count === 1 ? 'review' : 'reviews'}
        </p>
      </div>
    </Link>
  )
}
