'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
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

function scoreBadgeClass(score: number): string {
  if (score >= 4) return 'bg-green-50 text-green-700'
  if (score >= 3) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

function borderClass(score: number): string {
  if (score >= 4) return 'border-l-green-500'
  if (score >= 3) return 'border-l-amber-400'
  return 'border-l-red-400'
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ReviewList({ reviews, showSuccessToast }: { reviews: ReviewRow[]; showSuccessToast?: boolean }) {
  const [sort, setSort] = useState<SortKey>('helpful')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (showSuccessToast) {
      toast.success('Review submitted!', { description: 'Your review is now live.' })
      router.replace(pathname)
    }
  }, [showSuccessToast, router, pathname])

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-400">No reviews yet. Be the first to share your experience.</p>
      </div>
    )
  }

  const sorted = sortReviews(reviews, sort)

  return (
    <div className="space-y-6">
      <RatingDistribution reviews={reviews} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          <div
            key={review.id}
            className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${borderClass(review.score_overall)}`}
          >
            {/* Top row: score + WRA + date */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${scoreBadgeClass(review.score_overall)}`}
                >
                  {review.score_overall}/5
                </span>
                {review.would_rent_again !== null && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${review.would_rent_again ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
                  >
                    {review.would_rent_again ? 'Would rent again' : 'Would not rent again'}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                Anonymous Tenant · {formatDate(review.created_at)}
              </span>
            </div>

            {/* Tenancy metadata */}
            {(review.move_in_year || review.rent_amount) && (
              <p className="mb-3 text-xs text-slate-400">
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

            {/* Review body */}
            <p className="text-sm leading-relaxed text-slate-700">
              &ldquo;{review.body}&rdquo;
            </p>

            {/* Helpful count */}
            {review.helpful_count > 0 && (
              <p className="mt-3 text-xs text-slate-400">
                {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found
                this helpful
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
