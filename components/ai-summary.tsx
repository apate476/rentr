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

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Use setTimeout to avoid setState in effect
    setTimeout(() => {
      setError(null)
      setLoading(true)
    }, 0)
    fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId }),
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error('Failed to generate summary')
        }
        return r.json()
      })
      .then((data) => {
        if (data.praised?.length > 0 || data.issues?.length > 0) {
          setSummary(data)
        }
      })
      .catch((err) => {
        console.error('AI summary error:', err)
        setError('Unable to generate AI summary at this time')
      })
      .finally(() => setLoading(false))
  }, [propertyId])

  if (loading) {
    return (
      <div className="mb-6 space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
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

  if (error) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <p className="text-xs text-amber-800">{error}. Please try refreshing the page.</p>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs">
        <span className="bg-primary rounded px-1.5 py-0.5 font-[family-name:var(--font-poppins)] text-[10px] font-black tracking-wider text-white uppercase">
          AI
        </span>
        <span className="text-slate-500">
          Summary · Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
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
        <p className="border-t border-slate-100 pt-2 text-xs text-slate-500">{summary.trend}</p>
      )}
    </div>
  )
}
