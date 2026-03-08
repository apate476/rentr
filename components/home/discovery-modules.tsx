import Link from 'next/link'
import { Trophy, Clock, Volume2, ThumbsUp } from 'lucide-react'

const discoveryItems = [
  {
    icon: Volume2,
    title: 'Quietest buildings',
    description: 'Properties with the lowest noise levels',
    href: '/search?sort=quietest',
    color: 'bg-amber-500',
  },
  {
    icon: Trophy,
    title: 'Most reviewed neighborhoods',
    description: 'Areas with the most renter feedback',
    href: '/search?sort=recent',
    color: 'bg-green-500',
  },
  {
    icon: ThumbsUp,
    title: 'Buildings renters would rent again',
    description: 'Properties with high return rates',
    href: '/search?sort=overall&would_rent_again=true',
    color: 'bg-blue-500',
  },
  {
    icon: Clock,
    title: 'Recently reviewed properties',
    description: 'Fresh feedback from tenants',
    href: '/search?sort=recent',
    color: 'bg-purple-500',
  },
]

export function DiscoveryModules() {
  return (
    <section className="border-warm-border bg-warm-bg border-b">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <h2 className="font-display text-warm-text text-3xl">Discover properties</h2>
          <p className="text-warm-muted mt-2 text-sm">
            Explore rentals by decision-relevant insights
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {discoveryItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group border-warm-border from-warm-card to-warm-secondary/30 hover:border-warm-text/20 relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-warm-text/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl transition-opacity group-hover:opacity-50" />
                <div className="from-warm-text to-warm-text/80 relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-transform group-hover:scale-110">
                  <Icon className="text-warm-card h-6 w-6" />
                </div>
                <h3 className="font-display text-warm-text group-hover:text-warm-text/90 relative mb-2 text-lg font-medium transition-colors">
                  {item.title}
                </h3>
                <p className="text-warm-muted relative text-sm leading-relaxed">
                  {item.description}
                </p>
                <div className="text-warm-text relative mt-4 flex items-center text-xs font-medium opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  Explore
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
