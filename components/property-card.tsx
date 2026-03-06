import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

function scoreColor(score: number | null) {
  if (!score) return 'text-muted-foreground'
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-yellow-600'
  return 'text-red-500'
}

export function PropertyCard({ property }: { property: Property }) {
  const { id, address, city, state, avg_overall, review_count, property_type } = property

  return (
    <Link
      href={`/property/${id}`}
      className="bg-card hover:border-primary/40 flex items-center justify-between rounded-2xl border p-5 shadow-sm transition-colors"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold">{address}</p>
        <p className="text-muted-foreground text-sm">
          {city}, {state}
          {property_type && (
            <span className="ml-2 rounded-full border px-2 py-0.5 text-xs capitalize">
              {property_type}
            </span>
          )}
        </p>
      </div>

      <div className="ml-4 shrink-0 text-right">
        {avg_overall ? (
          <p className={`text-2xl font-bold ${scoreColor(avg_overall)}`}>
            {avg_overall.toFixed(1)}
          </p>
        ) : (
          <p className="text-muted-foreground text-2xl font-bold">—</p>
        )}
        <p className="text-muted-foreground text-xs">
          {review_count} {review_count === 1 ? 'review' : 'reviews'}
        </p>
      </div>
    </Link>
  )
}
