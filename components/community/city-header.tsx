'use client'

import { MapPin, Home, MessageSquare } from 'lucide-react'
import type { CityStats } from '@/types/community.types'

interface CityHeaderProps {
  city: string
  state: string
  stats: CityStats | null
}

export function CityHeader({ city, state, stats }: CityHeaderProps) {
  return (
    <div className="border-warm-border from-warm-card to-warm-secondary/30 mb-8 rounded-xl border bg-gradient-to-br p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="text-warm-text h-5 w-5" />
        <h1 className="font-display text-warm-text text-3xl font-bold">
          {city}, {state}
        </h1>
      </div>
      <p className="text-warm-muted mb-4 text-sm">
        Renter community for {city}, {state}
      </p>
      {stats && (
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Home className="text-warm-muted h-4 w-4" />
            <span className="text-warm-muted text-sm">
              <span className="text-warm-text font-semibold">{stats.property_count}</span>{' '}
              properties
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="text-warm-muted h-4 w-4" />
            <span className="text-warm-muted text-sm">
              <span className="text-warm-text font-semibold">{stats.post_count}</span> discussions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-warm-muted text-sm">
              <span className="text-warm-text font-semibold">{stats.review_count}</span> reviews
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
