import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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
        <h1 className="font-display text-4xl text-warm-text sm:text-5xl">
          {fullName ?? 'Your profile'}
        </h1>
        {fullName && (
          <p className="mt-2 text-sm text-warm-muted">Anonymous Tenant · rentr member since {memberSince}</p>
        )}
      </div>

      {/* Account card */}
      <div className="mb-12 rounded-xl border border-warm-border bg-gradient-to-br from-warm-card to-warm-secondary/30 p-8 shadow-lg">
        <h2 className="mb-6 text-xs font-bold uppercase tracking-wider text-warm-muted">
          Account
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {fullName && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-warm-muted">Full name</span>
              <span className="text-sm font-medium text-warm-text">{fullName}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-warm-muted">Email</span>
            <span className="text-sm font-medium text-warm-text">{user.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-warm-muted">Member since</span>
            <span className="text-sm font-medium text-warm-text">{memberSince}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-warm-muted">Reviews written</span>
            <span className="text-sm font-medium text-warm-text">
              {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-warm-text">Your reviews</h2>
            <p className="mt-1 text-sm text-warm-muted">Properties you've reviewed</p>
          </div>
          {myReviews.length > 0 && (
            <span className="text-sm text-warm-muted">
              {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </div>
      </div>

      {myReviews.length === 0 ? (
        <div className="rounded-xl border border-warm-border bg-gradient-to-br from-warm-card to-warm-secondary/30 p-12 text-center shadow-lg">
          <p className="text-sm text-warm-muted">You haven&apos;t written any reviews yet.</p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-warm-text px-6 py-3 text-sm font-medium text-warm-card transition-all hover:bg-warm-text/90 hover:shadow-md"
          >
            <span className="inline-flex items-center gap-1.5">
              Search a property to review <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                className={`group block rounded-xl border border-warm-border border-l-4 bg-warm-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-warm-text/20 hover:-translate-y-1 ${borderClass(review.score_overall)}`}
              >
                {/* Property address */}
                {prop && (
                  <div className="mb-4">
                    <p className="font-semibold text-warm-text">{prop.address}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-warm-muted">
                        {prop.city}, {prop.state}
                      </p>
                      {prop.property_type && (
                        <span className="rounded-full border border-warm-border px-2 py-0.5 text-xs capitalize text-warm-muted">
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
                  <span className="shrink-0 text-xs text-warm-muted">
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
                <p className="line-clamp-3 text-sm leading-relaxed text-warm-muted">
                  &ldquo;{review.body}&rdquo;
                </p>

                <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-warm-text opacity-0 transition-opacity group-hover:opacity-100">
                  View property <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
