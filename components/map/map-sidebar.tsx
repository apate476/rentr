'use client'

import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

function scoreBadgeClass(score: number | null): string {
  if (!score) return 'bg-slate-100 text-slate-400'
  if (score >= 4) return 'bg-green-50 text-green-700'
  if (score >= 3) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

interface MapSidebarProps {
  properties: Property[]
  isLoading?: boolean
}

export function MapSidebar({ properties, isLoading }: MapSidebarProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-warm-muted text-sm">Loading properties...</p>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p className="text-warm-muted text-center text-sm">
          No properties in this area. Pan or zoom to explore more.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-3 p-4">
        <div className="mb-2">
          <h2 className="text-warm-text text-sm font-semibold">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </h2>
          <p className="text-warm-muted mt-0.5 text-xs">Visible on map</p>
        </div>

        {properties.map((property) => {
          const { id, address, city, state, avg_overall, review_count } = property

          return (
            <Link
              key={id}
              href={`/property/${id}`}
              className="border-warm-border bg-warm-card flex items-start justify-between gap-3 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="text-warm-text truncate text-sm font-medium">{address}</p>
                <p className="text-warm-muted mt-0.5 truncate text-xs">
                  {city}, {state}
                </p>
                {review_count > 0 && (
                  <p className="text-warm-muted mt-1 text-xs">
                    {review_count} {review_count === 1 ? 'review' : 'reviews'}
                  </p>
                )}
              </div>

              {avg_overall && (
                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-sm font-bold ${scoreBadgeClass(avg_overall)}`}
                  >
                    {avg_overall.toFixed(1)}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
