'use client'

import Link from 'next/link'
import { formatDate, formatScore } from '@/lib/dashboard/utils'
import type { DashboardReview } from '@/types/dashboard.types'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'

interface ReviewCardProps {
  review: DashboardReview
  onView?: (reviewId: string) => void
  onEdit?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
}

function scoreBadgeClass(score: number): string {
  if (score >= 4) return 'bg-green-500 text-white'
  if (score >= 3) return 'bg-amber-400 text-white'
  return 'bg-red-500 text-white'
}

export function ReviewCard({ review, onView, onEdit, onDelete }: ReviewCardProps) {
  const { property, scoreOverall, bodyExcerpt, helpfulVotes, createdAt, photoCount } = review

  return (
    <div className="border-warm-border bg-warm-card hover:border-warm-text/20 min-h-[120px] rounded-xl border p-5 shadow-sm transition-all hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/property/${property.id}`}
            className="group block"
            onClick={() => onView?.(review.id)}
          >
            <h3 className="text-warm-text group-hover:text-brand-500 font-semibold transition-colors">
              {property.address}
            </h3>
            <p className="text-warm-muted mt-0.5 text-sm">
              {property.city}, {property.state}
            </p>
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`rounded-lg px-3 py-1 text-sm font-black text-white shadow-sm ${scoreBadgeClass(scoreOverall)}`}
            >
              {formatScore(scoreOverall)}
            </span>
            <span className="text-warm-muted text-sm">💬 {helpfulVotes} helpful</span>
            {photoCount > 0 && <span className="text-warm-muted text-sm">📷 {photoCount}</span>}
          </div>

          <p className="text-warm-text mt-3 line-clamp-2 text-sm">{bodyExcerpt}</p>

          <p className="text-warm-muted mt-2 text-xs">{formatDate(createdAt)}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(review.id)}
            className="h-8 w-8 p-0"
            aria-label="View review"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(review.id)}
            className="h-8 w-8 p-0"
            aria-label="Edit review"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(review.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
