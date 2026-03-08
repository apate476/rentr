'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, TrendingUp, FileText, CheckCircle2, Shield } from 'lucide-react'

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
      label: 'Anonymous renter reviews',
      description: 'Your identity stays private',
    },
    {
      icon: CheckCircle2,
      label: 'Moderated submissions',
      description: 'Verified & reviewed',
    },
    {
      icon: FileText,
      label: 'Transparent scoring methodology',
      description: 'See how scores work',
      href: '/methodology',
    },
    {
      icon: Shield,
      label: 'No landlord editing of reviews',
      description: 'Reviews stay authentic',
    },
  ]

  return (
    <section className="border-b border-warm-border bg-gradient-to-b from-warm-bg to-warm-secondary/20">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon
            const content = (
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-warm-text to-warm-text/80 shadow-md transition-transform group-hover:scale-110 sm:mb-0 sm:mr-3">
                  <Icon className="h-6 w-6 text-warm-card" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-warm-text">{item.label}</div>
                  <div className="mt-1 text-xs text-warm-muted">{item.description}</div>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-xl border border-warm-border bg-warm-card p-5 shadow-sm transition-all hover:shadow-lg hover:border-warm-text/20 hover:-translate-y-1"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={item.label}
                className="rounded-xl border border-warm-border bg-warm-card p-5 shadow-sm"
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
