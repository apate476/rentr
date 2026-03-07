'use client'

import { useState } from 'react'
import { useDashboardActivity } from '@/lib/dashboard/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ActivityTimeline() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const { data, isLoading, error } = useDashboardActivity(period)

  if (error) {
    return (
      <div className="rounded-2xl border border-warm-border bg-warm-card p-6 text-center text-warm-muted">
        <p>Failed to load activity data: {error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-warm-border bg-warm-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-warm-text font-display">Activity Timeline</h2>
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
        <Skeleton className="h-[300px] w-full rounded-lg bg-warm-secondary" />
      ) : data ? (
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          <div className="h-[300px] flex items-end gap-1">
            {data.timeline.map((item, index) => {
              const maxCount = Math.max(...data.timeline.map((i) => i.count), 1)
              const height = (item.count / maxCount) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-warm-text rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${item.count} reviews`}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-sm text-warm-muted pt-4 border-t border-warm-border">
            <div>
              <span className="font-medium text-warm-text">Peak:</span> {data.peakActivity.date} ({data.peakActivity.count} reviews)
            </div>
            <div>
              <span className="font-medium text-warm-text">Avg:</span> {data.averagePerPeriod.toFixed(1)}/day
            </div>
            <div>
              <span className="font-medium text-warm-text">Total:</span> {data.totalInPeriod} reviews
            </div>
            <div>
              <span className="font-medium text-warm-text">Trend:</span>{' '}
              <span
                className={
                  data.trend === 'increasing'
                    ? 'text-green-700'
                    : data.trend === 'decreasing'
                      ? 'text-red-600'
                      : 'text-warm-muted'
                }
              >
                {data.trend === 'increasing' ? '↑ Increasing' : data.trend === 'decreasing' ? '↓ Decreasing' : '→ Stable'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-warm-muted">
          <p>No activity data available</p>
        </div>
      )}
    </div>
  )
}
