import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type MyReview = {
  id: string
  score_overall: number
  body: string
  created_at: string
  move_in_year: number | null
  move_out_year: number | null
  would_rent_again: boolean | null
  property_id: string
  properties: {
    id: string
    address: string
    city: string
    state: string
    property_type: string | null
  } | null
}

function scoreBadgeClass(score: number): string {
  if (score >= 4) return 'bg-green-500 text-white'
  if (score >= 3) return 'bg-amber-400 text-white'
  return 'bg-red-500 text-white'
}

function borderClass(score: number): string {
  if (score >= 4) return 'border-l-green-500'
  if (score >= 3) return 'border-l-amber-400'
  return 'border-l-red-400'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: myReviewsRaw } = await (supabase as any)
    .from('reviews')
    .select(
      'id, score_overall, body, created_at, move_in_year, move_out_year, would_rent_again, property_id, properties(id, address, city, state, property_type)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const myReviews = (myReviewsRaw ?? []) as MyReview[]

  const fullName = user.user_metadata?.full_name as string | undefined

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-display text-warm-text text-4xl sm:text-5xl">
          {fullName ?? 'Your profile'}
        </h1>
        {fullName && (
          <p className="text-warm-muted mt-2 text-sm">
            Anonymous Tenant · rentr member since {memberSince}
          </p>
        )}
      </div>

      {/* Account card */}
      <div className="border-warm-border from-warm-card to-warm-secondary/30 mb-12 rounded-xl border bg-gradient-to-br p-8 shadow-lg">
        <h2 className="text-warm-muted mb-6 text-xs font-bold tracking-wider uppercase">Account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {fullName && (
            <div className="flex flex-col gap-1">
              <span className="text-warm-muted text-xs">Full name</span>
              <span className="text-warm-text text-sm font-medium">{fullName}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-warm-muted text-xs">Email</span>
            <span className="text-warm-text text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-warm-muted text-xs">Member since</span>
            <span className="text-warm-text text-sm font-medium">{memberSince}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-warm-muted text-xs">Reviews written</span>
            <span className="text-warm-text text-sm font-medium">
              {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-warm-text text-2xl">Your reviews</h2>
            <p className="text-warm-muted mt-1 text-sm">Properties you&apos;ve reviewed</p>
          </div>
          {myReviews.length > 0 && (
            <span className="text-warm-muted text-sm">
              {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </div>
      </div>

      {myReviews.length === 0 ? (
        <div className="border-warm-border from-warm-card to-warm-secondary/30 rounded-xl border bg-gradient-to-br p-12 text-center shadow-lg">
          <p className="text-warm-muted text-sm">You haven&apos;t written any reviews yet.</p>
          <Link
            href="/search"
            className="bg-warm-text text-warm-card hover:bg-warm-text/90 mt-4 inline-flex items-center gap-1.5 rounded-lg px-6 py-3 text-sm font-medium transition-all hover:shadow-md"
          >
            <span className="inline-flex items-center gap-1.5">
              Search a property to review{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {myReviews.map((review) => {
            const prop = review.properties
            return (
              <Link
                key={review.id}
                href={`/property/${review.property_id}`}
                className={`group border-warm-border bg-warm-card hover:border-warm-text/20 block rounded-xl border border-l-4 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${borderClass(review.score_overall)}`}
              >
                {/* Property address */}
                {prop && (
                  <div className="mb-4">
                    <p className="text-warm-text font-semibold">{prop.address}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-warm-muted text-sm">
                        {prop.city}, {prop.state}
                      </p>
                      {prop.property_type && (
                        <span className="border-warm-border text-warm-muted rounded-full border px-2 py-0.5 text-xs capitalize">
                          {prop.property_type}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Score + WRA + date row */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg px-3 py-1 text-sm font-black text-white shadow-sm ${scoreBadgeClass(review.score_overall)}`}
                    >
                      {review.score_overall}/5
                    </span>
                    {review.would_rent_again !== null && (
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium text-white shadow-sm ${review.would_rent_again ? 'bg-green-500' : 'bg-red-500'}`}
                      >
                        {review.would_rent_again ? 'Would rent again' : 'Would not rent again'}
                      </span>
                    )}
                  </div>
                  <span className="text-warm-muted shrink-0 text-xs">
                    {review.move_in_year && (
                      <>
                        {review.move_in_year}
                        {review.move_out_year ? `–${review.move_out_year}` : '–present'}
                        {' · '}
                      </>
                    )}
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {/* Body excerpt */}
                <p className="text-warm-muted line-clamp-3 text-sm leading-relaxed">
                  &ldquo;{review.body}&rdquo;
                </p>

                <p className="text-warm-text mt-4 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  View property{' '}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
