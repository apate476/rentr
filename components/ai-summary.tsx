'use client'

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type Summary = {
  praised: string[]
  issues: string[]
  trend: string | null
}

export function AiSummary({
  propertyId,
  reviewCount,
}: {
  propertyId: string
  reviewCount: number
}) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.praised?.length > 0 || data.issues?.length > 0) {
          setSummary(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [propertyId])

  if (loading) {
    return (
      <div className="bg-card mb-6 space-y-3 rounded-2xl border p-4">
        <Skeleton className="h-3 w-32" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-6 w-28 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="bg-card mb-6 space-y-3 rounded-2xl border p-4">
      <p className="text-muted-foreground text-xs font-medium">
        ✦ AI Summary · Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </p>

      {summary.praised.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-green-700">Praised</p>
          <div className="flex flex-wrap gap-2">
            {summary.praised.map((item, i) => (
              <span
                key={i}
                className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-800"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.issues.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-red-600">Reported issues</p>
          <div className="flex flex-wrap gap-2">
            {summary.issues.map((item, i) => (
              <span
                key={i}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.trend && (
        <p className="text-muted-foreground border-t pt-2 text-xs">{summary.trend}</p>
      )}
    </div>
  )
}
