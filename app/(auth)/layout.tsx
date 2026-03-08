import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="bg-warm-bg min-h-screen">
      {/* Header matching homepage design */}
      <header className="border-warm-border bg-warm-card/95 sticky top-0 z-50 border-b shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-warm-text text-2xl transition-transform hover:scale-105"
          >
            rentr
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/map"
              className="text-warm-text hover:text-warm-text/80 hidden items-center gap-1.5 text-sm font-medium transition-all hover:gap-2 sm:flex"
            >
              <MapPin className="h-4 w-4" />
              Browse Map
            </Link>
            {user ? (
              <Button
                asChild
                size="sm"
                className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg px-5 transition-all hover:shadow-md"
              >
                <Link href="/profile">My Reviews</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-warm-text hover:bg-warm-secondary hidden rounded-lg sm:flex"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg px-5 transition-all hover:shadow-md"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth content */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
