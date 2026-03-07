'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, TrendingUp, FileText, CheckCircle2 } from 'lucide-react'

export function TrustRow() {
  const [recentActivityCount, setRecentActivityCount] = useState<number | undefined>(undefined)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const res = await fetch('/api/homepage/stats')
        const data = await res.json()
        if (data.data?.recentReviews) {
          setRecentActivityCount(data.data.recentReviews)
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error)
      }
    }

    fetchRecentActivity()
  }, [])
  const trustItems = [
    {
      icon: Lock,
      label: 'Anonymous reviews',
      description: 'Your identity stays private',
    },
    {
      icon: TrendingUp,
      label: 'Recent activity',
      description: recentActivityCount
        ? `${recentActivityCount.toLocaleString()}+ reviews this month`
        : 'Active community',
    },
    {
      icon: FileText,
      label: 'Score methodology',
      description: 'See how we calculate',
      href: '/methodology',
    },
    {
      icon: CheckCircle2,
      label: 'Moderated submissions',
      description: 'Verified & reviewed',
    },
  ]

  return (
    <section className="border-b border-warm-border bg-warm-bg">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon
            const content = (
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm-secondary sm:mb-0 sm:mr-3">
                  <Icon className="h-5 w-5 text-warm-text" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-warm-text">{item.label}</div>
                  <div className="mt-0.5 text-xs text-warm-muted">{item.description}</div>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-lg border border-warm-border bg-warm-card p-4 transition-colors hover:bg-warm-secondary"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={item.label}
                className="rounded-lg border border-warm-border bg-warm-card p-4"
              >
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
