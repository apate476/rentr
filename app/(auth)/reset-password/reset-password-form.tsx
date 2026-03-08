'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePasswordFromReset } from '@/lib/supabase/actions'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

const initialState = { error: null, success: false }

export function ResetPasswordForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updatePasswordFromReset, initialState)

  // Note: Supabase handles the token via URL hash, which is processed by the callback route
  // If user reaches this page without a valid session, they need to use the reset link

  if (state.success) {
    return (
      <div className="border-warm-border bg-warm-card rounded-2xl border p-8 shadow-lg">
        <div className="mb-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h1 className="font-display text-warm-text text-2xl font-bold">Password Reset</h1>
          <p className="text-warm-muted mt-1 text-sm">Your password has been successfully reset.</p>
        </div>
        <Button
          onClick={() => router.push('/login')}
          className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full"
        >
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="border-warm-border bg-warm-card rounded-2xl border p-8 shadow-sm">
      <div className="mb-6">
        <Link
          href="/login"
          className="text-warm-muted hover:text-warm-text mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        <h1 className="font-display text-warm-text text-2xl font-bold">Set New Password</h1>
        <p className="text-warm-muted mt-1 text-sm">Enter your new password below.</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-warm-text">
            New Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={8}
            className="border-warm-border bg-warm-bg text-warm-text focus-visible:ring-primary/20"
          />
          <p className="text-warm-muted text-xs">Must be at least 8 characters</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm_password" className="text-warm-text">
            Confirm Password
          </Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className="border-warm-border bg-warm-bg text-warm-text focus-visible:ring-primary/20"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full"
        >
          {isPending ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  )
}
