'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'

interface HomepageStats {
  totalProperties: number
  totalReviews: number
  recentReviews: number
  topCities: Array<{ city: string; state: string; reviewCount: number }>
  wouldRentAgainPct: number | null
  lastUpdated: string
}

export function EnhancedStats() {
  const [stats, setStats] = useState<HomepageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/homepage/stats')
        const data = await res.json()
        if (data.data) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch homepage stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="h-9 w-20 animate-pulse rounded bg-warm-secondary" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-warm-secondary" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    // Fallback to static stats if API fails
    return (
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
        <div className="text-center">
          <div className="font-display text-3xl text-warm-text">12,400+</div>
          <div className="mt-0.5 text-xs text-warm-muted">Properties reviewed</div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl text-warm-text">38,000+</div>
          <div className="mt-0.5 text-xs text-warm-muted">Tenant reviews</div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl text-warm-text">200+</div>
          <div className="mt-0.5 text-xs text-warm-muted">Cities covered</div>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`
    }
    return `${num.toLocaleString()}+`
  }

  return (
    <div className="mt-16 space-y-12">
      {/* Main Stats */}
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
        <div className="group text-center transition-transform hover:scale-105">
          <div className="font-display text-4xl font-black text-warm-text drop-shadow-sm">
            {formatNumber(stats.totalProperties)}
          </div>
          <div className="mt-1 text-xs font-medium text-warm-muted">Properties reviewed</div>
        </div>
        <div className="group text-center transition-transform hover:scale-105">
          <div className="font-display text-4xl font-black text-warm-text drop-shadow-sm">
            {formatNumber(stats.totalReviews)}
          </div>
          <div className="mt-1 text-xs font-medium text-warm-muted">Tenant reviews</div>
        </div>
        <div className="group text-center transition-transform hover:scale-105">
          <div className="font-display text-4xl font-black text-warm-text drop-shadow-sm">
            {formatNumber(stats.recentReviews)}
          </div>
          <div className="mt-1 text-xs font-medium text-warm-muted">Reviews this month</div>
        </div>
        {stats.wouldRentAgainPct !== null && (
          <div className="group text-center transition-transform hover:scale-105">
            <div className="font-display text-4xl font-black text-warm-text drop-shadow-sm">
              {stats.wouldRentAgainPct}%
            </div>
            <div className="mt-1 text-xs font-medium text-warm-muted">Would rent again</div>
          </div>
        )}
      </div>

      {/* Top Cities Carousel */}
      {stats.topCities.length > 0 && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 text-center">
            <h3 className="font-display text-lg font-medium text-warm-text">
              Most reviewed cities
            </h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {stats.topCities.map((city, index) => (
              <Link
                key={`${city.city}-${city.state}`}
                href={`/search?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}`}
                className="group flex items-center gap-2 rounded-lg border border-warm-border bg-warm-card px-4 py-2.5 text-sm shadow-sm transition-all hover:shadow-md hover:border-warm-text/20 hover:-translate-y-0.5"
              >
                <MapPin className="h-4 w-4 text-warm-text transition-colors group-hover:text-warm-text/80" />
                <span className="font-semibold text-warm-text">
                  {city.city}, {city.state}
                </span>
                <span className="text-xs text-warm-muted">
                  {formatNumber(city.reviewCount)} reviews
                </span>
                <ChevronRight className="h-4 w-4 text-warm-muted opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
