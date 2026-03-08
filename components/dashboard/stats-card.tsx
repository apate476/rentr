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
      <div className="border-warm-border bg-warm-card min-h-[140px] rounded-2xl border p-6 shadow-sm">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-2 h-8 w-32" />
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
    <div className="border-warm-border bg-warm-card min-h-[140px] rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-warm-muted text-sm font-medium">{label}</p>
        {icon && <div className="text-warm-muted">{icon}</div>}
      </div>

      <div className="mb-2">
        <p className="text-warm-text font-display text-3xl font-bold">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—'}{' '}
            {trend.percentage.toFixed(1)}% {trend.period}
          </span>
        </div>
      )}
    </div>
  )
}
