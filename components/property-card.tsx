import Link from 'next/link'
import { createCitySlug } from '@/lib/community/utils'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

function scoreBadgeClass(score: number | null): string {
  if (!score) return 'bg-warm-secondary text-warm-muted'
  if (score >= 4) return 'bg-green-500 text-white'
  if (score >= 3) return 'bg-amber-400 text-white'
  return 'bg-red-500 text-white'
}

export function PropertyCard({ property }: { property: Property }) {
  const { id, address, city, state, avg_overall, review_count, property_type } = property

  return (
    <Link
      href={`/property/${id}`}
      className="group flex items-center justify-between rounded-xl border border-warm-border bg-warm-card p-5 shadow-sm transition-all hover:shadow-lg hover:border-warm-text/20 hover:-translate-y-1"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-warm-text">{address}</p>
        <p className="mt-0.5 flex items-center gap-2 text-sm text-warm-muted">
          <Link
            href={`/city/${createCitySlug(city, state)}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-warm-text transition-colors"
          >
            {city}, {state}
          </Link>
          {property_type && (
            <span className="rounded-full border border-warm-border px-2 py-0.5 text-xs capitalize text-warm-muted">
              {property_type}
            </span>
          )}
        </p>
      </div>

      <div className="ml-4 shrink-0 flex flex-col items-end gap-1">
        <span
          className={`rounded-lg px-3 py-1.5 text-base font-black text-white shadow-sm transition-transform group-hover:scale-105 ${scoreBadgeClass(avg_overall)}`}
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
