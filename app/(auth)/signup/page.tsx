'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signUp, signInWithGoogle } from '@/lib/supabase/actions'

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

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-[family-name:var(--font-poppins)] text-2xl font-bold">
          Create an account
        </CardTitle>
        <CardDescription>Start leaving honest reviews for renters like you</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Google OAuth */}
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full rounded-full" size="lg">
            <GoogleIcon />
            Continue with Google
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-2">or</span>
          </div>
        </div>

        {/* Email/Password form */}
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              className="rounded-lg"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full rounded-full" size="lg">
            {isPending ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            By creating an account, you agree to our{' '}
            <span className="cursor-pointer underline">Terms</span> and{' '}
            <span className="cursor-pointer underline">Privacy Policy</span>.
          </p>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
