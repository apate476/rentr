'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signInWithGoogle } from '@/lib/supabase/actions'

const initialState = { error: null }

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 shrink-0" aria-hidden>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const oauthError = searchParams.get('error')

  const [state, formAction, isPending] = useActionState(signIn, initialState)

  return (
    <div className="border-warm-border bg-warm-card rounded-2xl border p-8 shadow-lg">
      <h1 className="font-display text-warm-text text-2xl font-bold">Welcome back</h1>
      <p className="text-warm-muted mt-1 mb-6 text-sm">Sign in to your Rentr account</p>

      <div className="space-y-4">
        {/* Google OAuth */}
        <form action={signInWithGoogle}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button
            type="submit"
            variant="outline"
            className="border-warm-border text-warm-text hover:bg-warm-secondary w-full rounded-lg transition-all"
            size="lg"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-warm-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-warm-card text-warm-muted px-2">or</span>
          </div>
        </div>

        {/* Email/Password form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {(state.error || oauthError) && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error ?? 'Authentication failed. Please try again.'}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-warm-text">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="border-warm-border bg-warm-card text-warm-text focus-visible:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-warm-text">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-warm-muted hover:text-warm-text text-xs transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="border-warm-border bg-warm-card text-warm-text focus-visible:ring-primary/20 rounded-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full rounded-lg transition-all hover:shadow-md"
            size="lg"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-warm-muted text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-warm-text font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
