import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
  }

  const propertyIds = idsParam
    .split(',')
    .filter((id) => id.trim().length > 0)
    .slice(0, 3)

  if (propertyIds.length === 0) {
    return NextResponse.json({ error: 'No valid property IDs provided' }, { status: 400 })
  }

  // Fetch properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .in('id', propertyIds)

  if (propertiesError) {
    return NextResponse.json({ error: propertiesError.message }, { status: 500 })
  }

  // Fetch reviews for rent ranges and would-rent-again calculations
  const { data: reviews } = await supabase
    .from('reviews')
    .select('property_id, rent_amount, would_rent_again')
    .in('property_id', propertyIds)

  // Fetch AI summaries for pros/cons
  const summaries = await Promise.all(
    propertyIds.map(async (id) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/summarize`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: id }),
          }
        )
        if (response.ok) {
          return { property_id: id, summary: await response.json() }
        }
        return { property_id: id, summary: { praised: [], issues: [], trend: null } }
      } catch {
        return { property_id: id, summary: { praised: [], issues: [], trend: null } }
      }
    })
  )

  // Calculate rent ranges and would-rent-again percentages
  const propertyData = properties.map((property: { id: string }) => {
    const propertyReviews = (reviews?.filter(
      (r: { property_id: string }) => r.property_id === property.id
    ) || []) as Array<{
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
            (wouldRentAgainReviews.filter((r) => r.would_rent_again).length /
              wouldRentAgainReviews.length) *
              100
          )
        : null

    const summary = summaries.find((s) => s.property_id === property.id)?.summary || {
      praised: [],
      issues: [],
      trend: null,
    }

    return {
      ...property,
      rent_range: rentRange,
      would_rent_again_pct: wouldRentAgainPct,
      top_pros: summary.praised || [],
      top_complaints: summary.issues || [],
    }
  })

  return NextResponse.json({ properties: propertyData })
}
