'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatNumber } from '@/lib/dashboard/utils'
import type { Trend } from '@/types/dashboard.types'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardProps {
  label: string
  value: number | string
  trend?: Trend
  icon?: React.ReactNode
  isLoading?: boolean
}

export function StatsCard({ label, value, trend, icon, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="min-h-[140px] rounded-2xl border border-warm-border bg-warm-card p-6 shadow-sm">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-40" />
      </div>
    )
  }

  const trendColor =
    trend?.direction === 'up'
      ? 'text-green-700'
      : trend?.direction === 'down'
        ? 'text-red-600'
        : 'text-warm-muted'

  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus

  return (
    <div className="min-h-[140px] rounded-2xl border border-warm-border bg-warm-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-warm-muted">{label}</p>
        {icon && <div className="text-warm-muted">{icon}</div>}
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-warm-text font-display">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—'} {trend.percentage.toFixed(1)}%{' '}
            {trend.period}
          </span>
        </div>
      )}
    </div>
  )
}
