'use client'

import Link from 'next/link'
import { X, MapPin, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

interface ComparisonProperty extends PropertyRow {
  rent_range?: { min: number; max: number; avg: number } | null
  would_rent_again_pct?: number | null
  top_pros?: string[]
  top_complaints?: string[]
}

interface ComparisonTableProps {
  properties: ComparisonProperty[]
  onRemove: (propertyId: string) => void
}

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
  if (!score) return 'bg-slate-100 text-slate-400'
  if (score >= 4) return 'bg-green-50 text-green-700'
  if (score >= 3) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

function getWinner(properties: ComparisonProperty[], key: keyof PropertyRow): number | null {
  const scores = properties
    .map((p, idx) => ({ score: p[key] as number | null, idx }))
    .filter((s) => s.score !== null)
  if (scores.length === 0) return null
  const maxScore = Math.max(...scores.map((s) => s.score!))
  const winners = scores.filter((s) => s.score === maxScore)
  return winners.length === 1 ? winners[0].idx : null
}

export function ComparisonTable({ properties, onRemove }: ComparisonTableProps) {
  if (properties.length === 0) {
    return (
      <div className="border-warm-border bg-warm-card rounded-xl border p-12 text-center">
        <p className="text-warm-muted">No properties to compare. Add properties to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Property Headers */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Property</div>
        {properties.map((property) => (
          <div key={property.id} className="relative">
            <Button
              onClick={() => onRemove(property.id)}
              variant="ghost"
              size="sm"
              className="text-warm-muted absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
            <Link
              href={`/property/${property.id}`}
              className="border-warm-border bg-warm-card block rounded-lg border p-4 transition-all hover:shadow-md"
            >
              <p className="text-warm-text font-semibold">{property.address}</p>
              <p className="text-warm-muted mt-1 flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                {property.city}, {property.state}
              </p>
            </Link>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Overall Score</div>
        {properties.map((property, idx) => {
          const winner = getWinner(properties, 'avg_overall') === idx
          return (
            <div key={property.id} className="text-center">
              <span
                className={`inline-block rounded-full px-4 py-2 text-2xl font-black ${scoreBadgeClass(property.avg_overall)}`}
              >
                {property.avg_overall ? property.avg_overall.toFixed(1) : '—'}
              </span>
              {winner && (
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  Best
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Review Count */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Review Count</div>
        {properties.map((property) => (
          <div key={property.id} className="text-warm-text text-center text-sm">
            {property.review_count}
          </div>
        ))}
      </div>

      {/* Category Scores */}
      {SCORE_CATEGORIES.map(({ key, label }) => {
        const winnerIdx = getWinner(properties, key as keyof PropertyRow)
        return (
          <div
            key={key}
            className="border-warm-border grid gap-4 border-t pt-4"
            style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
          >
            <div className="font-display text-warm-text text-sm font-semibold">{label}</div>
            {properties.map((property, idx) => {
              const score = property[key as keyof PropertyRow] as number | null
              const isWinner = winnerIdx === idx
              return (
                <div key={property.id} className="text-center">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${scoreBadgeClass(score)}`}
                  >
                    {score ? score.toFixed(1) : '—'}
                  </span>
                  {isWinner && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-green-600">
                      <Star className="h-3 w-3" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Rent Range */}
      <div
        className="border-warm-border grid gap-4 border-t pt-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Rent Range</div>
        {properties.map((property) => (
          <div key={property.id} className="text-warm-text text-center text-sm">
            {property.rent_range ? (
              <div>
                <div>
                  ${property.rent_range.min.toLocaleString()} - $
                  {property.rent_range.max.toLocaleString()}
                </div>
                <div className="text-warm-muted text-xs">
                  Avg: ${property.rent_range.avg.toLocaleString()}/mo
                </div>
              </div>
            ) : (
              <span className="text-warm-muted">—</span>
            )}
          </div>
        ))}
      </div>

      {/* Would Rent Again */}
      <div
        className="border-warm-border grid gap-4 border-t pt-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Would Rent Again</div>
        {properties.map((property) => (
          <div key={property.id} className="text-warm-text text-center text-sm">
            {property.would_rent_again_pct !== null ? (
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${
                  (property.would_rent_again_pct ?? 0) >= 60
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {property.would_rent_again_pct}%
              </span>
            ) : (
              <span className="text-warm-muted">—</span>
            )}
          </div>
        ))}
      </div>

      {/* Top Pros */}
      <div
        className="border-warm-border grid gap-4 border-t pt-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Top Pros</div>
        {properties.map((property) => (
          <div key={property.id} className="space-y-1">
            {property.top_pros && property.top_pros.length > 0 ? (
              <ul className="space-y-1 text-left">
                {property.top_pros.slice(0, 3).map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-green-700">
                    <span className="mt-0.5">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-warm-muted text-xs">—</span>
            )}
          </div>
        ))}
      </div>

      {/* Top Complaints */}
      <div
        className="border-warm-border grid gap-4 border-t pt-4"
        style={{ gridTemplateColumns: `repeat(${properties.length + 1}, 1fr)` }}
      >
        <div className="font-display text-warm-text text-sm font-semibold">Top Complaints</div>
        {properties.map((property) => (
          <div key={property.id} className="space-y-1">
            {property.top_complaints && property.top_complaints.length > 0 ? (
              <ul className="space-y-1 text-left">
                {property.top_complaints.slice(0, 3).map((complaint, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-red-600">
                    <span className="mt-0.5">•</span>
                    <span>{complaint}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-warm-muted text-xs">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
