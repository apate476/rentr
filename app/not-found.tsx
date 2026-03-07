import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-bg px-6">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-warm-text mb-4">404</h1>
        <h2 className="font-display text-2xl text-warm-text mb-2">Page Not Found</h2>
        <p className="text-warm-muted mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-warm-text text-warm-card hover:bg-warm-text/90">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-warm-border text-warm-text hover:bg-warm-secondary">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search Properties
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
