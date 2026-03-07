'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthState = { error: string | null }

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  const redirectTo = (formData.get('redirectTo') as string) || '/'
  redirect(redirectTo)
}

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string).trim()

  if (!fullName) return { error: 'Full name is required.' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (error) return { error: error.message }

  // Persist display name to profiles table (best-effort — may be RLS-gated until email confirmed)
  if (data.user) {
    await (supabase as any).from('profiles').upsert({ id: data.user.id, display_name: fullName })
  }

  redirect('/verify-email')
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error || !data.url) redirect('/login?error=oauth_failed')

  redirect(data.url)
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(
  prevState: AuthState & { success?: boolean },
  formData: FormData
): Promise<AuthState & { success?: boolean }> {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return { error: 'Email is required.', success: false }
  }

  // Reset password - Supabase will send email
  // Note: We don't reveal if email exists for security
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  // Always return success to prevent email enumeration
  return { error: null, success: true }
}

export async function updatePasswordFromReset(
  prevState: AuthState & { success?: boolean },
  formData: FormData
): Promise<AuthState & { success?: boolean }> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || !confirmPassword) {
    return { error: 'All fields are required.', success: false }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long.', success: false }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.', success: false }
  }

  // Check if user has a valid session (from the reset link)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Invalid or expired reset link. Please request a new one.', success: false }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  })

  if (updateError) {
    return { error: updateError.message || 'Failed to reset password. Please try again.', success: false }
  }

  return { error: null, success: true }
}
