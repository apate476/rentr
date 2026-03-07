import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
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
      {/* Back */}
      <Link
        href={`/property/${id}`}
        className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to property
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-slate-900">
          Write a review
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {property.address} · {property.city}, {property.state}
        </p>
      </div>

      <ReviewWizard propertyId={id} action={action} />
    </div>
  )
}
