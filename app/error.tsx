'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-bg px-6">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-warm-text mb-4">500</h1>
        <h2 className="font-display text-2xl text-warm-text mb-2">Something went wrong</h2>
        <p className="text-warm-muted mb-8 max-w-md">
          We&apos;re sorry, but something unexpected happened. Please try again or return to the home page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-warm-text text-warm-card hover:bg-warm-text/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="border-warm-border text-warm-text hover:bg-warm-secondary">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
