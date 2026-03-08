'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, FileText, CheckCircle2, Shield } from 'lucide-react'

export function TrustRow() {
  const [, setRecentActivityCount] = useState<number | undefined>(undefined)

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
    <section className="border-warm-border from-warm-bg to-warm-secondary/20 border-b bg-gradient-to-b">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon
            const content = (
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <div className="from-warm-text to-warm-text/80 mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-transform group-hover:scale-110 sm:mr-3 sm:mb-0">
                  <Icon className="text-warm-card h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-warm-text font-semibold">{item.label}</div>
                  <div className="text-warm-muted mt-1 text-xs">{item.description}</div>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group border-warm-border bg-warm-card hover:border-warm-text/20 rounded-xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={item.label}
                className="border-warm-border bg-warm-card rounded-xl border p-5 shadow-sm"
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
