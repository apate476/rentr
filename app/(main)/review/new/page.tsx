import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewPropertyWizard } from './new-property-wizard'

interface Props {
  searchParams: Promise<{ q?: string; place_id?: string }>
}

export default async function NewPropertyPage({ searchParams }: Props) {
  const { q, place_id } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirectTo = `/review/new?q=${encodeURIComponent(q ?? '')}&place_id=${place_id ?? ''}`
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  if (!q) redirect('/search')

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">No reviews yet for</p>
        <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold">{q}</h1>
        <p className="text-muted-foreground text-sm">Be the first to share your experience.</p>
      </div>

      <NewPropertyWizard address={q} placeId={place_id ?? null} />
    </div>
  )
}
