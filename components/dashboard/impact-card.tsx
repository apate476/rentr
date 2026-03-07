'use client'

import { useDashboardImpact } from '@/lib/dashboard/hooks'
import { formatNumber, formatPercentage } from '@/lib/dashboard/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus, Award, Users } from 'lucide-react'

export function ImpactCard() {
  const { data, isLoading, error } = useDashboardImpact()

  if (error) {
    return (
      <div className="rounded-2xl border border-warm-border bg-warm-card p-6 text-center text-warm-muted">
        <p>Failed to load impact data: {error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-warm-border bg-gradient-to-br from-brand-50 to-warm-card p-6 shadow-sm">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-12 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
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
    <div className="sticky top-24 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-warm-card p-6 shadow-sm">
      <h2 className="text-xl font-bold text-warm-text font-display mb-6">Community Impact</h2>

      <div className="space-y-6">
        {/* Impact Score */}
        <div>
          <p className="text-sm font-medium text-warm-muted mb-2">Impact Score</p>
          <p className="text-4xl font-bold text-warm-text font-display">{data.impactScore}/100</p>
        </div>

        {/* Rank */}
        <div>
          <p className="text-sm font-medium text-warm-muted mb-1">Rank</p>
          <p className="text-lg font-semibold text-warm-text">
            Top {100 - data.rankPercentile}% ({formatPercentage(data.rankPercentile / 100, 1)} percentile)
          </p>
        </div>

        {/* Helpful Votes */}
        <div>
          <p className="text-sm font-medium text-warm-muted mb-1">Helpful Votes</p>
          <p className="text-2xl font-bold text-warm-text font-display">{formatNumber(data.totalHelpfulVotes)}</p>
          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span>
              {data.helpfulVotesTrend.direction === 'up' ? '↑' : data.helpfulVotesTrend.direction === 'down' ? '↓' : '—'}{' '}
              {data.helpfulVotesTrend.percentage.toFixed(1)}% {data.helpfulVotesTrend.period}
            </span>
          </div>
          <p className="text-xs text-warm-muted mt-1">
            Avg {data.averageHelpfulVotesPerReview.toFixed(1)} per review
          </p>
        </div>

        {/* Pioneer Properties */}
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-warm-text" />
          <div>
            <p className="text-sm font-medium text-warm-muted">Pioneer Properties</p>
            <p className="text-lg font-semibold text-warm-text">{data.pioneerProperties}</p>
          </div>
        </div>

        {/* Estimated Users Helped */}
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-warm-text" />
          <div>
            <p className="text-sm font-medium text-warm-muted">Estimated Users Helped</p>
            <p className="text-lg font-semibold text-warm-text">{formatNumber(data.estimatedUsersHelped)}</p>
          </div>
        </div>

        {/* Engagement */}
        <div className="pt-4 border-t border-warm-border">
          <p className="text-sm font-medium text-warm-muted mb-1">Engagement</p>
          <p className="text-sm text-warm-text">
            {data.reviewsWithVotes} of {formatNumber(data.reviewsWithVotes + (data.reviewsWithVotesPercentage === 0 ? 1 : 0))} reviews have votes (
            {formatPercentage(data.reviewsWithVotesPercentage, 1)})
          </p>
        </div>
      </div>
    </div>
  )
}
