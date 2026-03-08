'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SettingsState = {
  error: string | null
  success: string | null
}

export async function updateProfile(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to update your profile.', success: null }
  }

  const displayName = (formData.get('display_name') as string)?.trim()

  if (!displayName) {
    return { error: 'Display name is required.', success: null }
  }

  // Update profile table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', user.id)

  if (profileError) {
    return { error: 'Failed to update profile. Please try again.', success: null }
  }

  // Update user metadata
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: displayName },
  })

  if (metadataError) {
    return { error: 'Failed to update profile. Please try again.', success: null }
  }

  revalidatePath('/settings')
  revalidatePath('/profile')
  return { error: null, success: 'Profile updated successfully!' }
}

export async function updatePassword(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to change your password.', success: null }
  }

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!currentPassword || !newPassword) {
    return { error: 'All password fields are required.', success: null }
  }

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters long.', success: null }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.', success: null }
  }

  // Verify current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (verifyError) {
    return { error: 'Current password is incorrect.', success: null }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: 'Failed to update password. Please try again.', success: null }
  }

  return { error: null, success: 'Password updated successfully!' }
}

export async function updateEmail(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to change your email.', success: null }
  }

  const newEmail = (formData.get('new_email') as string)?.trim().toLowerCase()

  if (!newEmail) {
    return { error: 'Email is required.', success: null }
  }

  if (newEmail === user.email) {
    return { error: 'New email must be different from your current email.', success: null }
  }

  // Update email (Supabase will send verification email)
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (updateError) {
    return {
      error: updateError.message || 'Failed to update email. Please try again.',
      success: null,
    }
  }

  return {
    error: null,
    success: 'Email update requested. Please check your new email for a verification link.',
  }
}

export async function updateMapProvider(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to update map settings.', success: null }
  }

  const mapProvider = (formData.get('map_provider') as string)?.trim()

  if (!mapProvider || (mapProvider !== 'mapbox' && mapProvider !== 'google')) {
    return { error: 'Invalid map provider selected.', success: null }
  }

  // Update profile table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update({ map_provider: mapProvider })
    .eq('id', user.id)

  if (profileError) {
    console.error('Map provider update error:', profileError)
    // Check if the column doesn't exist (migration not run)
    const errorMessage = profileError.message || ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (profileError as any).code || ''

    if (
      errorCode === '42703' || // PostgreSQL: column does not exist
      (errorMessage.toLowerCase().includes('column') &&
        errorMessage.toLowerCase().includes('map_provider')) ||
      errorMessage.toLowerCase().includes('does not exist')
    ) {
      return {
        error:
          'The map_provider column does not exist. Please run the database migration: rentr/supabase/migrations/20260307000000_map_settings.sql',
        success: null,
      }
    }
    return {
      error: `Failed to update map settings: ${errorMessage || 'Unknown error'}. Please try again.`,
      success: null,
    }
  }

  revalidatePath('/settings')
  revalidatePath('/map')
  return { error: null, success: 'Map settings updated successfully!' }
}

export async function deleteAccount(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to delete your account.', success: null }
  }

  const confirmText = (formData.get('confirm_text') as string)?.trim()

  if (confirmText !== 'DELETE') {
    return { error: 'Please type "DELETE" to confirm.', success: null }
  }

  // Note: Account deletion requires service role key or admin API
  // For now, we'll mark the account for deletion and require admin action
  // In production, you should implement this via an API route with service role key
  return {
    error:
      'Account deletion is currently unavailable. Please contact support at support@rentr.app to delete your account.',
    success: null,
  }
}
