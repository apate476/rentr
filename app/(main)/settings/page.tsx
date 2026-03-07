import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get profile data
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-warm-text sm:text-5xl">Settings</h1>
        <p className="mt-2 text-sm text-warm-muted">Manage your account settings and preferences</p>
      </div>

      <SettingsForm
        user={user}
        displayName={profile?.display_name || user.user_metadata?.full_name || ''}
      />
    </div>
  )
}
