import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComparisonTable } from '@/components/compare/comparison-table'
import { CompareClient } from './client'

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids } = await searchParams

  if (!ids) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-xl border border-warm-border bg-warm-card p-12 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-warm-text">Compare Properties</h1>
          <p className="text-warm-muted">
            Add properties to compare by clicking &ldquo;Add to Compare&rdquo; on any property page.
          </p>
        </div>
      </div>
    )
  }

  const propertyIds = ids.split(',').filter((id) => id.trim().length > 0).slice(0, 3)

  if (propertyIds.length === 0) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch properties
  const { data: propertiesData, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .in('id', propertyIds)

  if (propertiesError || !propertiesData || propertiesData.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-xl border border-warm-border bg-warm-card p-12 text-center">
          <p className="text-warm-muted">Failed to load comparison data.</p>
        </div>
      </div>
    )
  }

  // Fetch reviews for rent ranges and would-rent-again
  const { data: reviews } = await supabase
    .from('reviews')
    .select('property_id, rent_amount, would_rent_again')
    .in('property_id', propertyIds)

  // Fetch AI summaries (async, will be handled client-side if needed)
  const properties = propertiesData.map((property: { id: string }) => {
    const propertyReviews = (reviews?.filter((r: { property_id: string }) => r.property_id === property.id) || []) as Array<{
      property_id: string
      rent_amount: number | null
      would_rent_again: boolean | null
    }>
    const rents = propertyReviews.map((r) => r.rent_amount).filter((r): r is number => r !== null)
    const rentRange =
      rents.length > 0
        ? {
            min: Math.min(...rents),
            max: Math.max(...rents),
            avg: Math.round(rents.reduce((a, b) => a + b, 0) / rents.length),
          }
        : null

    const wouldRentAgainReviews = propertyReviews.filter((r) => r.would_rent_again !== null)
    const wouldRentAgainPct =
      wouldRentAgainReviews.length >= 3
        ? Math.round(
            (wouldRentAgainReviews.filter((r) => r.would_rent_again).length / wouldRentAgainReviews.length) * 100
          )
        : null

    return {
      ...property,
      rent_range: rentRange,
      would_rent_again_pct: wouldRentAgainPct,
      top_pros: [], // Will be fetched client-side
      top_complaints: [], // Will be fetched client-side
    }
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-warm-text">Compare Properties</h1>
        <p className="mt-2 text-sm text-warm-muted">Side-by-side comparison of {properties.length} properties</p>
      </div>

      <CompareClient initialProperties={properties} />
    </div>
  )
}
