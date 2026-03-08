import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database.types'
import { ReviewList } from './review-list'
import { AiSummary } from '@/components/ai-summary'
import { CompareButton } from '@/components/compare/compare-button'
import { createCitySlug } from '@/lib/community/utils'

type PropertyRow = Database['public']['Tables']['properties']['Row']

const SCORE_CATEGORIES = [
  { key: 'avg_value', label: 'Value' },
  { key: 'avg_landlord', label: 'Landlord' },
  { key: 'avg_noise', label: 'Noise' },
  { key: 'avg_pests', label: 'Pests' },
  { key: 'avg_safety', label: 'Safety' },
  { key: 'avg_parking', label: 'Parking' },
  { key: 'avg_pets', label: 'Pet-friendly' },
  { key: 'avg_neighborhood', label: 'Neighborhood' },
] as const

function scoreBadgeClass(score: number | null): string {
  if (!score) return 'bg-warm-secondary text-warm-muted'
  if (score >= 4) return 'bg-green-500 text-white'
  if (score >= 3) return 'bg-amber-400 text-white'
  return 'bg-red-500 text-white'
}

function confidenceBadgeClass(level: 'Low' | 'Medium' | 'High'): string {
  if (level === 'High') return 'bg-green-500 text-white'
  if (level === 'Medium') return 'bg-amber-400 text-white'
  return 'bg-red-500 text-white'
}

function getConfidence(count: number): 'Low' | 'Medium' | 'High' {
  if (count < 3) return 'Low'
  if (count < 10) return 'Medium'
  return 'High'
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

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reviewed?: string }>
}) {
  const { id } = await params
  const { reviewed } = await searchParams
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

  const reviewsWithWRA = reviewList.filter((r) => r.would_rent_again !== null)
  const wouldRentAgainPct =
    reviewsWithWRA.length >= 3
      ? Math.round(
          (reviewsWithWRA.filter((r) => r.would_rent_again).length / reviewsWithWRA.length) * 100
        )
      : null

  const confidence = getConfidence(property.review_count ?? 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-warm-text text-4xl sm:text-5xl">{property.address}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link
              href={`/city/${createCitySlug(property.city, property.state)}`}
              className="text-warm-muted hover:text-warm-text text-sm transition-colors"
            >
              {property.city}, {property.state} {property.zip ?? ''}
            </Link>
            {property.property_type && (
              <span className="border-warm-border text-warm-muted rounded-full border px-2.5 py-0.5 text-xs capitalize">
                {property.property_type}
              </span>
            )}
          </div>
        </div>

        {/* Score block */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`rounded-lg px-5 py-2 text-3xl font-black text-white shadow-lg ${scoreBadgeClass(property.avg_overall)}`}
          >
            {property.avg_overall ? property.avg_overall.toFixed(1) : '—'}
          </span>
          <p className="text-warm-muted text-xs">
            {property.review_count} {property.review_count === 1 ? 'review' : 'reviews'}
          </p>
          {property.review_count > 0 && (
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-medium text-white shadow-sm ${confidenceBadgeClass(confidence)}`}
              >
                {confidence} confidence
              </span>
              {wouldRentAgainPct !== null && (
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium text-white shadow-sm ${wouldRentAgainPct >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  {wouldRentAgainPct}% would rent again
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="border-warm-border mb-10" />

      {/* Score grid */}
      {property.review_count > 0 && (
        <>
          <div className="border-warm-border from-warm-card to-warm-secondary/50 mb-10 grid grid-cols-4 gap-4 rounded-xl border bg-gradient-to-br p-6 shadow-lg">
            {SCORE_CATEGORIES.map(({ key, label }) => {
              const val = property[key as keyof PropertyRow] as number | null
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-2 text-center transition-transform hover:scale-105"
                >
                  <span
                    className={`rounded-lg px-3 py-1.5 text-base font-black text-white shadow-md ${scoreBadgeClass(val)}`}
                  >
                    {val ? val.toFixed(1) : '—'}
                  </span>
                  <span className="text-warm-text text-xs font-medium">{label}</span>
                </div>
              )
            })}
          </div>
          <hr className="border-warm-border mb-10" />
        </>
      )}

      {/* AI Summary */}
      {property.review_count > 0 && (
        <>
          <AiSummary propertyId={id} reviewCount={property.review_count ?? 0} />
          <hr className="border-warm-border mb-10" />
        </>
      )}

      {/* CTA */}
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div>
          {!user ? (
            <Button
              asChild
              className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg px-6"
            >
              <Link href={`/login?redirectTo=/property/${id}/review`}>
                Sign in to write a review
              </Link>
            </Button>
          ) : hasReviewed ? (
            <p className="text-warm-muted text-sm">You&apos;ve already reviewed this property.</p>
          ) : (
            <Button
              asChild
              className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg px-6"
            >
              <Link href={`/property/${id}/review`}>Write a review</Link>
            </Button>
          )}
        </div>
        <CompareButton propertyId={id} />
      </div>

      {/* Reviews */}
      <ReviewList reviews={reviewList} showSuccessToast={reviewed === '1'} />
    </div>
  )
}
