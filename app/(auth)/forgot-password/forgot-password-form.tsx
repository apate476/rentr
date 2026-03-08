'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/supabase/actions'
import { ArrowLeft, Mail } from 'lucide-react'

const initialState = { error: null, success: false }

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="border-warm-border bg-warm-card rounded-2xl border p-8 shadow-lg">
      <div className="mb-6">
        <Link
          href="/login"
          className="text-warm-muted hover:text-warm-text mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        <h1 className="font-display text-warm-text text-2xl font-bold">Reset Password</h1>
        <p className="text-warm-muted mt-1 text-sm">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <Mail className="mx-auto mb-2 h-12 w-12 text-green-600" />
            <p className="text-sm font-medium text-green-900">Check your email</p>
            <p className="mt-1 text-sm text-green-700">
              We&apos;ve sent a password reset link to your email address. Please check your inbox
              and follow the instructions.
            </p>
          </div>
          <Button asChild className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
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
              className="border-warm-border bg-warm-bg text-warm-text focus-visible:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full"
          >
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <p className="text-warm-muted text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-warm-text font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
