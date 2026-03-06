'use client'

import { useState } from 'react'
import { RatingDistribution } from '@/components/rating-distribution'

type ReviewRow = {
  id: string
  score_overall: number
  score_value: number
  score_landlord: number
  score_noise: number
  score_pests: number
  score_safety: number
  score_parking: number
  score_pets: number
  score_neighborhood: number
  body: string
  rent_amount: number | null
  move_in_year: number | null
  move_out_year: number | null
  lease_type: string | null
  would_rent_again: boolean | null
  helpful_count: number
  comment_count: number
  created_at: string
}

type SortKey = 'helpful' | 'newest' | 'highest' | 'lowest'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'helpful', label: 'Most helpful' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
]

function scoreColor(score: number | null) {
  if (!score) return 'text-muted-foreground'
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-yellow-600'
  return 'text-red-500'
}

function sortReviews(reviews: ReviewRow[], sort: SortKey): ReviewRow[] {
  return [...reviews].sort((a, b) => {
    if (sort === 'helpful') return b.helpful_count - a.helpful_count
    if (sort === 'newest')
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'highest') return b.score_overall - a.score_overall
    if (sort === 'lowest') return a.score_overall - b.score_overall
    return 0
  })
}

export function ReviewList({ reviews }: { reviews: ReviewRow[] }) {
  const [sort, setSort] = useState<SortKey>('helpful')

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
      </div>
    )
  }

  const sorted = sortReviews(reviews, sort)

  return (
    <div className="space-y-6">
      <RatingDistribution reviews={reviews} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="bg-card rounded-lg border px-3 py-1.5 text-xs"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {sorted.map((review) => (
          <div key={review.id} className="bg-card space-y-3 rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${scoreColor(review.score_overall)}`}>
                  {review.score_overall}/5
                </span>
                {review.would_rent_again !== null && (
                  <span className="text-muted-foreground text-xs">
                    {review.would_rent_again ? '✓ Would rent again' : "✗ Wouldn't rent again"}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                Anonymous Tenant ·{' '}
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {(review.move_in_year || review.rent_amount) && (
              <p className="text-muted-foreground text-xs">
                {review.move_in_year && (
                  <>
                    {review.move_in_year}
                    {review.move_out_year ? `–${review.move_out_year}` : '–present'}
                  </>
                )}
                {review.rent_amount && review.move_in_year && ' · '}
                {review.rent_amount && `$${review.rent_amount.toLocaleString()}/mo`}
                {review.lease_type && ` · ${review.lease_type}`}
              </p>
            )}

            <p className="text-sm leading-relaxed">{review.body}</p>

            {review.helpful_count > 0 && (
              <p className="text-muted-foreground text-xs">
                {review.helpful_count} found this helpful
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
