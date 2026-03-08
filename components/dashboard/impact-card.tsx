'use client'

import { useDashboardImpact } from '@/lib/dashboard/hooks'
import { formatNumber, formatPercentage } from '@/lib/dashboard/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus, Award, Users } from 'lucide-react'

export function ImpactCard() {
  const { data, isLoading, error } = useDashboardImpact()

  if (error) {
    return (
      <div className="border-warm-border bg-warm-card text-warm-muted rounded-2xl border p-6 text-center">
        <p>Failed to load impact data: {error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="border-warm-border from-brand-50 to-warm-card rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-2 h-12 w-24" />
        <Skeleton className="mb-4 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const TrendIcon =
    data.helpfulVotesTrend.direction === 'up'
      ? TrendingUp
      : data.helpfulVotesTrend.direction === 'down'
        ? TrendingDown
        : Minus

  const trendColor =
    data.helpfulVotesTrend.direction === 'up'
      ? 'text-green-700'
      : data.helpfulVotesTrend.direction === 'down'
        ? 'text-red-600'
        : 'text-warm-muted'

  return (
    <div className="border-brand-200 from-brand-50 to-warm-card sticky top-24 rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
      <h2 className="text-warm-text font-display mb-6 text-xl font-bold">Community Impact</h2>

      <div className="space-y-6">
        {/* Impact Score */}
        <div>
          <p className="text-warm-muted mb-2 text-sm font-medium">Impact Score</p>
          <p className="text-warm-text font-display text-4xl font-bold">{data.impactScore}/100</p>
        </div>

        {/* Rank */}
        <div>
          <p className="text-warm-muted mb-1 text-sm font-medium">Rank</p>
          <p className="text-warm-text text-lg font-semibold">
            Top {100 - data.rankPercentile}% ({formatPercentage(data.rankPercentile / 100, 1)}{' '}
            percentile)
          </p>
        </div>

        {/* Helpful Votes */}
        <div>
          <p className="text-warm-muted mb-1 text-sm font-medium">Helpful Votes</p>
          <p className="text-warm-text font-display text-2xl font-bold">
            {formatNumber(data.totalHelpfulVotes)}
          </p>
          <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span>
              {data.helpfulVotesTrend.direction === 'up'
                ? '↑'
                : data.helpfulVotesTrend.direction === 'down'
                  ? '↓'
                  : '—'}{' '}
              {data.helpfulVotesTrend.percentage.toFixed(1)}% {data.helpfulVotesTrend.period}
            </span>
          </div>
          <p className="text-warm-muted mt-1 text-xs">
            Avg {data.averageHelpfulVotesPerReview.toFixed(1)} per review
          </p>
        </div>

        {/* Pioneer Properties */}
        <div className="flex items-center gap-2">
          <Award className="text-warm-text h-5 w-5" />
          <div>
            <p className="text-warm-muted text-sm font-medium">Pioneer Properties</p>
            <p className="text-warm-text text-lg font-semibold">{data.pioneerProperties}</p>
          </div>
        </div>

        {/* Estimated Users Helped */}
        <div className="flex items-center gap-2">
          <Users className="text-warm-text h-5 w-5" />
          <div>
            <p className="text-warm-muted text-sm font-medium">Estimated Users Helped</p>
            <p className="text-warm-text text-lg font-semibold">
              {formatNumber(data.estimatedUsersHelped)}
            </p>
          </div>
        </div>

        {/* Engagement */}
        <div className="border-warm-border border-t pt-4">
          <p className="text-warm-muted mb-1 text-sm font-medium">Engagement</p>
          <p className="text-warm-text text-sm">
            {data.reviewsWithVotes} of{' '}
            {formatNumber(data.reviewsWithVotes + (data.reviewsWithVotesPercentage === 0 ? 1 : 0))}{' '}
            reviews have votes ({formatPercentage(data.reviewsWithVotesPercentage, 1)})
          </p>
        </div>
      </div>
    </div>
  )
}
