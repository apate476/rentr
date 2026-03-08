import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AddressSearch } from '@/components/address-search'
import { PropertyCard } from '@/components/property-card'
import { SearchSortBar } from '@/components/search-sort-bar'
import type { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

interface SearchPageProps {
  searchParams: Promise<{ q?: string; city?: string; place_id?: string; sort?: string }>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

function scoreBadgeClass(score: number | null): string {
  if (!score) return 'bg-warm-secondary text-warm-muted'
  if (score >= 4) return 'bg-green-500 text-white'
  if (score >= 3) return 'bg-amber-400 text-white'
  return 'bg-red-500 text-white'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySort(query: any, sort: string): any {
  switch (sort) {
    case 'count':
      return query.order('review_count', { ascending: false })
    case 'highest':
      return query.order('avg_overall', { ascending: false })
    case 'lowest':
      return query.order('avg_overall', { ascending: true })
    default:
      return query.order('avg_overall', { ascending: false })
  }
}

const QUICK_ACTIONS = [
  {
    title: 'Leave a review',
    desc: 'Share your experience anonymously and help future renters decide.',
    href: '/review/new',
    label: 'Write a review',
  },
  {
    title: 'How scores work',
    desc: 'See exactly how our 9-category scoring system is calculated.',
    href: '/methodology',
    label: 'Learn more',
  },
  {
    title: 'Property alerts',
    desc: 'Get notified when new reviews are added for saved properties.',
    href: '#',
    label: 'Coming soon',
    disabled: true,
  },
]

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, city, place_id, sort = 'overall' } = await searchParams
  const supabase = await createClient()

  // ── Address search ─────────────────────────────────────────────────────────
  if (q) {
    let query = (supabase as any)
      .from('properties')
      .select('*')
      .ilike('address', `%${q}%`)
      .limit(10)

    query = applySort(query, sort)
    const { data } = await query
    const properties = data as PropertyRow[] | null

    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <AddressSearch />
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-warm-muted">
            {properties && properties.length > 0
              ? `${properties.length} result${properties.length !== 1 ? 's' : ''} for "${q}"`
              : `No results for "${q}"`}
          </p>
          {properties && properties.length > 1 && (
            <SearchSortBar q={q} currentSort={sort} />
          )}
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-warm-border bg-gradient-to-br from-warm-card to-warm-secondary/30 p-12 text-center shadow-lg">
            <p className="mb-2 font-display text-2xl text-warm-text">&ldquo;{q}&rdquo;</p>
            <p className="mb-6 text-sm leading-relaxed text-warm-muted">
              No reviews yet for this address. Be the first to share your experience.
            </p>
            <Link
              href={`/review/new?q=${encodeURIComponent(q)}${place_id ? `&place_id=${place_id}` : ''}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-warm-text px-6 py-3 text-sm font-medium text-warm-card transition-all hover:bg-warm-text/90 hover:shadow-md"
            >
              <span className="inline-flex items-center gap-1.5">
                Write the first review <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}
      </div>
    )
  }

  // ── City search ────────────────────────────────────────────────────────────
  if (city) {
    let query = (supabase as any)
      .from('properties')
      .select('*')
      .ilike('city', `%${city}%`)
      .limit(20)

    query = applySort(query, sort)
    const { data } = await query
    const properties = data as PropertyRow[] | null

    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <AddressSearch />
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-warm-muted">
            {properties && properties.length > 0
              ? `${properties.length} propert${properties.length !== 1 ? 'ies' : 'y'} in ${city}`
              : `No reviewed properties in ${city} yet`}
          </p>
          {properties && properties.length > 1 && (
            <SearchSortBar city={city} currentSort={sort} />
          )}
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-warm-border bg-gradient-to-br from-warm-card to-warm-secondary/30 p-12 text-center shadow-lg">
            <p className="mb-2 font-display text-2xl text-warm-text">{city}</p>
            <p className="text-sm leading-relaxed text-warm-muted">
              No reviewed properties here yet. Search a specific address to leave the first review.
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Dashboard home ─────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // User's own reviews (joined with properties)
  const { data: myReviewsRaw } = await (supabase as any)
    .from('reviews')
    .select('property_id, properties(id, address, city, state, avg_overall, review_count, property_type)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3)
  const myReviews = myReviewsRaw as any[] | null

  // Recent platform reviews
  const { data: recentRaw } = await (supabase as any)
    .from('reviews')
    .select('id, score_overall, body, created_at, property_id, properties(id, address, city, state)')
    .order('created_at', { ascending: false })
    .limit(6)
  const recentReviews = recentRaw as any[] | null

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero search */}
      <section className="border-b border-warm-border bg-warm-card px-6 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-warm-muted">
            Search any address or city
          </p>
          <AddressSearch />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">

        {/* Your reviews */}
        {myReviews && myReviews.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-warm-text">Your reviews</h2>
                <p className="mt-1 text-sm text-warm-muted">Properties you've reviewed</p>
              </div>
              <Link href="/profile" className="text-sm text-warm-text hover:text-warm-text/80 font-medium">
                <span className="inline-flex items-center gap-1">
                  See all <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myReviews.map((r: any) => {
                const p = r.properties
                if (!p) return null
                return <PropertyCard key={r.property_id} property={p as PropertyRow} />
              })}
            </div>
          </section>
        )}

        {/* Recently on Rentr */}
        {recentReviews && recentReviews.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="font-display text-2xl text-warm-text">Recently on Rentr</h2>
              <p className="mt-1 text-sm text-warm-muted">What renters are saying right now</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentReviews.map((r: any) => {
                const p = r.properties
                if (!p) return null
                const score = r.score_overall as number | null
                return (
                  <Link
                    key={r.id}
                    href={`/property/${p.id}`}
                    className="group flex flex-col gap-3 rounded-xl border border-warm-border bg-warm-card p-5 shadow-sm transition-all hover:shadow-lg hover:border-warm-text/20 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-warm-text">{p.address}</p>
                        <p className="text-xs text-warm-muted">
                          {p.city}, {p.state}
                        </p>
                      </div>
                      {score && (
                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-black text-white shadow-sm ${scoreBadgeClass(score)}`}
                        >
                          {score.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {r.body && (
                      <p className="text-xs leading-relaxed text-warm-muted">
                        &ldquo;{truncate(r.body, 120)}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-warm-muted">
                      Anonymous Tenant · {formatDate(r.created_at)}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section>
          <div className="mb-6">
            <h2 className="font-display text-2xl text-warm-text">What you can do</h2>
            <p className="mt-1 text-sm text-warm-muted">Explore features and get started</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {QUICK_ACTIONS.map(({ title, desc, href, label, disabled }) => (
              <div
                key={title}
                className="group flex flex-col gap-3 rounded-xl border border-warm-border bg-gradient-to-br from-warm-card to-warm-secondary/30 p-6 shadow-sm transition-all hover:shadow-lg hover:border-warm-text/20"
              >
                <div>
                  <h3 className="font-display mb-2 text-lg text-warm-text">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-warm-muted">{desc}</p>
                </div>
                {disabled ? (
                  <span className="mt-auto text-xs font-medium text-warm-muted">{label}</span>
                ) : (
                  <Link
                    href={href}
                    className="mt-auto text-sm font-medium text-warm-text hover:text-warm-text/80"
                  >
                    <span className="inline-flex items-center gap-1">
                    {label} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
