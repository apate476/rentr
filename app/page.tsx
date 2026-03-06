import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AddressSearch } from '@/components/address-search'

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🔍',
    title: 'Search any address',
    desc: 'Type in any apartment, condo, or house. Our autocomplete finds it instantly.',
  },
  {
    step: '02',
    icon: '📖',
    title: 'Read real reviews',
    desc: 'See scores for landlord, noise, pests, value, and more — from real tenants.',
  },
  {
    step: '03',
    icon: '✍️',
    title: 'Share your experience',
    desc: 'Submit an anonymous review to help future tenants make informed decisions.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white to-purple-50">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-primary font-[family-name:var(--font-poppins)] text-2xl font-black tracking-tight">
          rentr
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-3">
            <h1 className="font-[family-name:var(--font-poppins)] text-5xl leading-tight font-black tracking-tight sm:text-6xl">
              Know before
              <br />
              <span className="text-primary">you sign.</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-md text-lg">
              Real reviews from real tenants. Search any address and see what it&apos;s actually
              like to live there.
            </p>
          </div>

          <AddressSearch />

          <p className="text-muted-foreground text-sm">
            Free to search and review.{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create an account →
            </Link>
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y bg-white/60 px-4 py-6 text-center">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Built for renters, by renters — always anonymous, always honest
        </p>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-4xl px-4 py-20">
        <h2 className="mb-12 text-center font-[family-name:var(--font-poppins)] text-3xl font-bold">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-card rounded-2xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <span className="text-muted-foreground font-mono text-xs font-bold">{step}</span>
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-poppins)] font-bold">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-primary/5 border-t px-4 py-16 text-center">
        <h2 className="mb-4 font-[family-name:var(--font-poppins)] text-2xl font-bold">
          Ready to find your next home?
        </h2>
        <Button asChild size="lg" className="rounded-full px-10">
          <Link href="/signup">Get started for free</Link>
        </Button>
      </section>

      <footer className="text-muted-foreground px-6 py-6 text-center text-xs">
        © {new Date().getFullYear()} Rentr · Real reviews from real tenants.
      </footer>
    </div>
  )
}
