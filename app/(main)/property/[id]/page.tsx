import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { ReviewList } from './review-list'

type PropertyRow = Database['public']['Tables']['properties']['Row']

const SCORE_CATEGORIES = [
  { key: 'avg_value', label: 'Value', emoji: '💰' },
  { key: 'avg_landlord', label: 'Landlord', emoji: '👤' },
  { key: 'avg_noise', label: 'Noise', emoji: '🔊' },
  { key: 'avg_pests', label: 'Pests', emoji: '🐛' },
  { key: 'avg_safety', label: 'Safety', emoji: '🛡️' },
  { key: 'avg_parking', label: 'Parking', emoji: '🚗' },
  { key: 'avg_pets', label: 'Pet-friendly', emoji: '🐾' },
  { key: 'avg_neighborhood', label: 'Neighborhood', emoji: '🏙️' },
] as const

function scoreColor(score: number | null) {
  if (!score) return 'text-muted-foreground'
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-yellow-600'
  return 'text-red-500'
}

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

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: _property } = await supabase.from('properties').select('*').eq('id', id).single()
  const property = _property as PropertyRow | null
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!property) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      'id, score_overall, score_value, score_landlord, score_noise, score_pests, score_safety, score_parking, score_pets, score_neighborhood, body, rent_amount, move_in_year, move_out_year, lease_type, would_rent_again, helpful_count, comment_count, created_at'
    )
    .eq('property_id', id)
    .order('helpful_count', { ascending: false })

  const reviewList = (reviews ?? []) as ReviewRow[]

  let hasReviewed = false
  if (user) {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('property_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    hasReviewed = !!data
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Back */}
      <Link
        href="/search"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        ← Back to search
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold">
              {property.address}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {property.city}, {property.state} {property.zip ?? ''}
              {property.property_type && (
                <span className="ml-2 rounded-full border px-2 py-0.5 text-xs capitalize">
                  {property.property_type}
                </span>
              )}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-4xl font-black ${scoreColor(property.avg_overall)}`}>
              {property.avg_overall ? property.avg_overall.toFixed(1) : '—'}
            </p>
            <p className="text-muted-foreground text-xs">
              🏠 Overall · {property.review_count}{' '}
              {property.review_count === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Score grid */}
      {property.review_count > 0 && (
        <div className="bg-card mb-8 grid grid-cols-4 gap-3 rounded-2xl border p-4">
          {SCORE_CATEGORIES.map(({ key, label, emoji }) => {
            const val = property[key as keyof PropertyRow] as number | null
            return (
              <div key={key} className="text-center">
                <p className="mb-0.5 text-base">{emoji}</p>
                <p className={`text-base font-bold ${scoreColor(val)}`}>
                  {val ? val.toFixed(1) : '—'}
                </p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mb-10">
        {!user ? (
          <Link
            href={`/login?redirectTo=/property/${id}/review`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Sign in to write a review
          </Link>
        ) : hasReviewed ? (
          <p className="text-muted-foreground text-sm">
            You&apos;ve already reviewed this property.
          </p>
        ) : (
          <Link
            href={`/property/${id}/review`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Write a review
          </Link>
        )}
      </div>

      {/* Reviews */}
      <ReviewList reviews={reviewList} />
    </div>
  )
}
