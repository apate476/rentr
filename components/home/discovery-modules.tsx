import Link from 'next/link'
import { Map, Trophy, Clock, Volume2 } from 'lucide-react'

const discoveryItems = [
  {
    icon: Map,
    title: 'Explore on Map',
    description: 'Browse reviewed properties visually',
    href: '/map',
    color: 'bg-blue-500',
  },
  {
    icon: Trophy,
    title: 'Top Rated Properties',
    description: 'See the highest-rated rentals',
    href: '/search?sort=overall',
    color: 'bg-green-500',
  },
  {
    icon: Clock,
    title: 'Recently Reviewed',
    description: 'Fresh feedback from tenants',
    href: '/search?sort=recent',
    color: 'bg-purple-500',
  },
  {
    icon: Volume2,
    title: 'Find Quiet Places',
    description: 'Properties with low noise levels',
    href: '/search?sort=quietest',
    color: 'bg-amber-500',
  },
]

export function DiscoveryModules() {
  return (
    <section className="border-b border-warm-border bg-warm-bg">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl text-warm-text">Discover properties</h2>
          <p className="mt-2 text-sm text-warm-muted">
            Explore rentals by what matters most to you
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {discoveryItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-xl border border-warm-border bg-warm-card p-6 transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warm-secondary">
                  <Icon className="h-6 w-6 text-warm-text" />
                </div>
                <h3 className="mb-2 font-display text-lg font-medium text-warm-text">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-warm-muted">{item.description}</p>
                <div className="mt-4 flex items-center text-xs font-medium text-warm-text opacity-0 transition-opacity group-hover:opacity-100">
                  Explore
                  <svg
                    className="ml-1 h-4 w-4"
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
