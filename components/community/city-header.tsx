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
    <div className="mb-8 rounded-xl border border-warm-border bg-gradient-to-br from-warm-card to-warm-secondary/30 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-warm-text" />
        <h1 className="font-display text-3xl font-bold text-warm-text">
          {city}, {state}
        </h1>
      </div>
      <p className="mb-4 text-sm text-warm-muted">Renter community for {city}, {state}</p>
      {stats && (
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-warm-muted" />
            <span className="text-sm text-warm-muted">
              <span className="font-semibold text-warm-text">{stats.property_count}</span> properties
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-warm-muted" />
            <span className="text-sm text-warm-muted">
              <span className="font-semibold text-warm-text">{stats.post_count}</span> discussions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-warm-muted">
              <span className="font-semibold text-warm-text">{stats.review_count}</span> reviews
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
