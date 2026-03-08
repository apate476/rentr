import Link from 'next/link'
import { Search, Eye, Shield, MapPin, MessageSquare, DollarSign, ThumbsUp, ArrowRight, Sparkles, TrendingUp, Users, Star, CheckCircle2 } from 'lucide-react'
import { AddressSearch } from '@/components/address-search'
import { Button } from '@/components/ui/button'
import { TrustRow } from '@/components/home/trust-row'
import { EnhancedStats } from '@/components/home/enhanced-stats'
import { DiscoveryModules } from '@/components/home/discovery-modules'
import { createClient } from '@/lib/supabase/server'

const STEPS = [
  {
    icon: Search,
    title: 'Search for a property',
    description:
      'Type in any property address, building name, city, neighborhood, or zip code to find reviews from real renters who lived there.',
  },
  {
    icon: Eye,
    title: 'Read renter experiences',
    description:
      'See scores across 9 categories, anonymous reviews, and detailed experiences about noise, pests, landlord responsiveness, and more.',
  },
  {
    icon: Shield,
    title: 'Avoid signing a bad lease',
    description:
      'Know exactly what you&apos;re getting into before you sign — from recurring red flags to hidden gems.',
  },
]

type MockProperty = {
  id: number
  address: string
  city: string
  state: string
  zip: string
  score: number
  reviewCount: number
  avgRent: number
  wouldReturnPct: number
  topScores: { label: string; score: number }[]
}

const MOCK_PROPERTIES: MockProperty[] = [
  {
    id: 1,
    address: '742 Evergreen Terrace',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    score: 4.1,
    reviewCount: 3,
    avgRent: 1833,
    wouldReturnPct: 67,
    topScores: [
      { label: 'Landlord Responsiveness', score: 4.7 },
      { label: 'Maintenance', score: 4.7 },
      { label: 'Safety', score: 4.3 },
    ],
  },
  {
    id: 2,
    address: '1200 SE Hawthorne Blvd',
    city: 'Portland',
    state: 'OR',
    zip: '97214',
    score: 2.3,
    reviewCount: 2,
    avgRent: 1450,
    wouldReturnPct: 0,
    topScores: [
      { label: 'Noise Levels', score: 3.5 },
      { label: 'Safety', score: 3.0 },
      { label: 'Value for Money', score: 2.0 },
    ],
  },
  {
    id: 3,
    address: '88 Pike St',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    score: 3.0,
    reviewCount: 2,
    avgRent: 1325,
    wouldReturnPct: 50,
    topScores: [
      { label: 'Landlord Responsiveness', score: 3.5 },
      { label: 'Value for Money', score: 3.0 },
      { label: 'Noise Levels', score: 3.0 },
    ],
  },
  {
    id: 4,
    address: '350 NW 23rd Ave',
    city: 'Portland',
    state: 'OR',
    zip: '97210',
    score: 4.4,
    reviewCount: 5,
    avgRent: 2100,
    wouldReturnPct: 80,
    topScores: [
      { label: 'Value for Money', score: 4.5 },
      { label: 'Safety', score: 4.8 },
      { label: 'Noise Levels', score: 4.2 },
    ],
  },
]

function scoreBadgeBg(score: number): string {
  if (score >= 4) return 'bg-green-500'
  if (score >= 3) return 'bg-amber-400'
  return 'bg-red-500'
}

function scoreBarBg(score: number): string {
  if (score >= 4) return 'bg-green-500'
  if (score >= 3) return 'bg-amber-400'
  return 'bg-red-400'
}

function scoreNumColor(score: number): string {
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-amber-600'
  return 'text-red-500'
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Enhanced Nav with user state */}
      <header className="sticky top-0 z-50 border-b border-warm-border bg-warm-card/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link 
            href="/" 
            className="font-display text-2xl text-warm-text transition-transform hover:scale-105"
          >
            rentr
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/map"
              className="hidden items-center gap-1.5 text-sm font-medium text-warm-text transition-all hover:text-warm-text/80 hover:gap-2 sm:flex"
            >
              <MapPin className="h-4 w-4" />
              Browse Map
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="hidden text-sm font-medium text-warm-text transition-colors hover:text-warm-text/80 sm:block"
                >
                  My Reviews
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg bg-warm-text px-5 text-warm-card hover:bg-warm-text/90 transition-all hover:shadow-md"
                >
                  <Link href="/property/new">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Write Review
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden rounded-lg text-warm-text hover:bg-warm-secondary sm:flex"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg bg-warm-text px-5 text-warm-card hover:bg-warm-text/90 transition-all hover:shadow-md"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Enhanced Hero with animations */}
        <section className="relative overflow-hidden border-b border-warm-border bg-gradient-to-b from-warm-card via-warm-card to-warm-secondary/20">
          {/* Animated grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(220, 20%, 14%) 1px, transparent 1px), linear-gradient(90deg, hsl(220, 20%, 14%) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Decorative elements */}
          <div className="pointer-events-none absolute top-20 right-10 h-72 w-72 rounded-full bg-warm-text/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-warm-text/5 blur-3xl" />
          
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32">
            {/* Enhanced social proof pill */}
            <div className="group inline-flex items-center gap-2 rounded-full border border-warm-border bg-warm-secondary px-4 py-1.5 text-xs font-medium text-warm-muted transition-all hover:border-warm-text/20 hover:bg-warm-card hover:shadow-sm">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span>Trusted by thousands of renters</span>
              <TrendingUp className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <h1 className="mt-6 font-display text-5xl leading-[1.1] tracking-tight text-warm-text sm:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              Find out what it&apos;s really like to live there.
            </h1>

            <p className="mt-4 max-w-lg text-lg leading-relaxed text-warm-muted animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Anonymous renter reviews, real property scores, and recurring red flags — all before you sign a lease.
            </p>

            {/* Enhanced search section */}
            <div className="mt-10 w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <AddressSearch />
            </div>

            <p className="mt-4 text-xs text-warm-muted animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Search for an address, building, or city
            </p>

            {/* Quick action buttons for logged-in users */}
            {user && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-warm-border text-warm-text hover:bg-warm-secondary transition-all"
                >
                  <Link href="/map" className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Explore Map
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-warm-border text-warm-text hover:bg-warm-secondary transition-all"
                >
                  <Link href="/profile" className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    My Reviews
                  </Link>
                </Button>
              </div>
            )}

            {/* Stats */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
              <EnhancedStats />
            </div>
          </div>
        </section>

        {/* Trust Row */}
        <TrustRow />

        {/* Enhanced How rentr works with hover effects */}
        <section id="how-it-works" className="border-b border-warm-border bg-warm-bg">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="font-display text-3xl text-warm-text">How the platform works</h2>
              <p className="mt-2 text-sm text-warm-muted">
                Three simple steps to make confident housing decisions.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div 
                  key={step.title} 
                  className="group relative text-center transition-all hover:scale-105"
                >
                  <div className="mb-4 select-none font-display text-5xl font-black text-warm-text transition-colors group-hover:text-warm-text/90">
                    {i + 1}
                  </div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-secondary transition-all group-hover:bg-warm-text group-hover:shadow-lg">
                    <step.icon className="h-6 w-6 text-warm-text transition-colors group-hover:text-warm-card" />
                  </div>
                  <h3 className="mt-4 font-display text-lg text-warm-text transition-colors group-hover:text-warm-text/90">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-warm-muted">
                    {step.description}
                  </p>
                  <div className="mt-4 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4 text-warm-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discovery Modules */}
        <DiscoveryModules />

        {/* Enhanced Recently reviewed with better interactions */}
        <section className="bg-warm-bg">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl text-warm-text">Recently reviewed</h2>
                <p className="mt-1 text-sm text-warm-muted">
                  Fresh feedback from tenants across the country
                </p>
              </div>
              <Link
                href="/search?sort=recent"
                className="hidden items-center gap-1.5 text-sm font-medium text-warm-text transition-all hover:gap-2 sm:flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {MOCK_PROPERTIES.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="group rounded-xl border border-warm-border bg-warm-card p-5 transition-all hover:shadow-lg hover:border-warm-text/20 hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-warm-text">
                        {property.address}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-warm-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {property.city}, {property.state} {property.zip}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-base font-black text-white ${scoreBadgeBg(property.score)}`}
                    >
                      {property.score.toFixed(1)}/5
                    </span>
                  </div>

                  {/* Category bars */}
                  <div className="mb-4 space-y-2.5">
                    {property.topScores.map(({ label, score: s }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-36 shrink-0 truncate text-xs text-warm-muted">
                          {label}
                        </span>
                        <div className="h-1.5 flex-1 rounded-full bg-warm-secondary">
                          <div
                            className={`h-1.5 rounded-full ${scoreBarBg(s)}`}
                            style={{ width: `${(s / 5) * 100}%` }}
                          />
                        </div>
                        <span
                          className={`w-6 shrink-0 text-right text-xs font-bold ${scoreNumColor(s)}`}
                        >
                          {s.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced footer row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-warm-border pt-3 text-xs text-warm-muted">
                    <span className="flex items-center gap-1 transition-colors group-hover:text-warm-text">
                      <MessageSquare className="h-3 w-3" />
                      {property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                    <span className="flex items-center gap-1 transition-colors group-hover:text-warm-text">
                      <DollarSign className="h-3 w-3" />~${property.avgRent.toLocaleString()}/mo
                    </span>
                    <span className="flex items-center gap-1 transition-colors group-hover:text-warm-text">
                      <ThumbsUp className="h-3 w-3" />
                      {property.wouldReturnPct}% would return
                    </span>
                  </div>
                  
                  {/* View property indicator */}
                  <div className="mt-3 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-medium text-warm-text">View property</span>
                    <ArrowRight className="ml-1 h-3 w-3 text-warm-text" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Community Messaging Section */}
        <section className="border-t border-warm-border bg-gradient-to-b from-warm-bg to-warm-secondary/20">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
            <h2 className="font-display text-3xl text-warm-text">Your renter community is here.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-warm-muted">
              Thousands of renters are sharing honest experiences to help each other avoid bad leases.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-warm-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Anonymous participation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Renter-first information</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Peer insights over marketing claims</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA with user state awareness */}
        <section className="border-t border-warm-border bg-gradient-to-b from-warm-card to-warm-secondary/30">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-warm-border bg-warm-secondary px-4 py-1.5 text-xs font-medium text-warm-muted mb-6">
              <Star className="h-3 w-3 text-amber-500" />
              <span>Join {user ? 'thousands' : 'the community'}</span>
            </div>
            
            <h2 className="font-display text-3xl text-warm-text">
              Write the review you wish you had before moving in.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-warm-muted">
              Your anonymous review helps the next renter avoid a bad lease — or discover a hidden gem.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-lg bg-warm-text px-6 text-warm-card transition-all hover:bg-warm-text/90 hover:shadow-lg"
                  >
                    <Link href="/property/new" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Write a Review
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-lg border-warm-border px-6 text-warm-text transition-all hover:bg-warm-secondary hover:shadow-md"
                  >
                    <Link href="/search" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Browse renter discussions
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-lg bg-warm-text px-6 text-warm-card transition-all hover:bg-warm-text/90 hover:shadow-lg"
                  >
                    <Link href="/signup" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Write a Review
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-lg border-warm-border px-6 text-warm-text transition-all hover:bg-warm-secondary hover:shadow-md"
                  >
                    <Link href="/search" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Browse renter discussions
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            {/* Additional benefits for logged-out users */}
            {!user && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-warm-muted">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>100% anonymous</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>Takes 2 minutes</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-warm-border bg-warm-bg py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-text">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/map" className="text-warm-muted hover:text-warm-text transition-colors">
                    Browse Map
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-warm-muted hover:text-warm-text transition-colors">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/review/new" className="text-warm-muted hover:text-warm-text transition-colors">
                    Write Review
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-warm-muted hover:text-warm-text transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-text">About</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/#how-it-works" className="text-warm-muted hover:text-warm-text transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="text-warm-muted hover:text-warm-text transition-colors">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link href="/trust" className="text-warm-muted hover:text-warm-text transition-colors">
                    Trust & Safety
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-text">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-warm-muted hover:text-warm-text transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-warm-muted hover:text-warm-text transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-warm-muted hover:text-warm-text transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Brand */}
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-text">rentr</h3>
              <p className="text-xs leading-relaxed text-warm-muted">
                Real reviews from real tenants. Don&apos;t sign blind.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-warm-border pt-8 text-center">
            <p className="text-xs text-warm-muted">
              © {new Date().getFullYear()} rentr · Don&apos;t sign blind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
