import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewWizard } from './review-wizard'
import { createReview } from './actions'
import type { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirectTo=/property/${id}/review`)

  const { data: _property } = await supabase.from('properties').select('*').eq('id', id).single()
  const property = _property as PropertyRow | null

  if (!property) redirect('/search')

  // Check duplicate
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('property_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) redirect(`/property/${id}`)

  const action = createReview.bind(null, id)

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">Reviewing</p>
        <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
          {property.address}
        </h1>
        <p className="text-muted-foreground text-sm">
          {property.city}, {property.state}
        </p>
      </div>

      <ReviewWizard propertyId={id} action={action} />
    </div>
  )
}
