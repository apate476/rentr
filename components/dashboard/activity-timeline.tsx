'use client'

import { useState } from 'react'
import { useDashboardActivity } from '@/lib/dashboard/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ActivityTimeline() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const { data, isLoading, error } = useDashboardActivity(period)

  if (error) {
    return (
      <div className="border-warm-border bg-warm-card text-warm-muted rounded-2xl border p-6 text-center">
        <p>Failed to load activity data: {error}</p>
      </div>
    )
  }

  return (
    <div className="border-warm-border bg-warm-card rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-warm-text font-display text-xl font-bold">Activity Timeline</h2>
        <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="bg-warm-secondary h-[300px] w-full rounded-lg" />
      ) : data ? (
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          <div className="flex h-[300px] items-end gap-1">
            {data.timeline.map((item, index) => {
              const maxCount = Math.max(...data.timeline.map((i) => i.count), 1)
              const height = (item.count / maxCount) * 100
              return (
                <div key={index} className="flex flex-1 flex-col items-center">
                  <div
                    className="bg-warm-text w-full rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${item.count} reviews`}
                  />
                </div>
              )
            })}
          </div>

          <div className="text-warm-muted border-warm-border flex items-center justify-between border-t pt-4 text-sm">
            <div>
              <span className="text-warm-text font-medium">Peak:</span> {data.peakActivity.date} (
              {data.peakActivity.count} reviews)
            </div>
            <div>
              <span className="text-warm-text font-medium">Avg:</span>{' '}
              {data.averagePerPeriod.toFixed(1)}/day
            </div>
            <div>
              <span className="text-warm-text font-medium">Total:</span> {data.totalInPeriod}{' '}
              reviews
            </div>
            <div>
              <span className="text-warm-text font-medium">Trend:</span>{' '}
              <span
                className={
                  data.trend === 'increasing'
                    ? 'text-green-700'
                    : data.trend === 'decreasing'
                      ? 'text-red-600'
                      : 'text-warm-muted'
                }
              >
                {data.trend === 'increasing'
                  ? '↑ Increasing'
                  : data.trend === 'decreasing'
                    ? '↓ Decreasing'
                    : '→ Stable'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-warm-muted flex h-[300px] items-center justify-center">
          <p>No activity data available</p>
        </div>
      )}
    </div>
  )
}
