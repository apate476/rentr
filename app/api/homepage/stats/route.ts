import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // Total properties count
    const { count: totalProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })

    if (propertiesError) {
      throw propertiesError
    }

    // Total reviews count
    const { count: totalReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    if (reviewsError) {
      throw reviewsError
    }

    // Reviews in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { count: recentReviews, error: recentReviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (recentReviewsError) {
      throw recentReviewsError
    }

    // Top 8 most reviewed cities
    // We need to get cities with their review counts by joining properties and reviews
    const { data: topCitiesData, error: topCitiesError } = await supabase
      .from('properties')
      .select('city, state, review_count')
      .gt('review_count', 0)
      .order('review_count', { ascending: false })
      .limit(100) // Get more to aggregate by city+state

    if (topCitiesError) {
      throw topCitiesError
    }

    // Aggregate cities by city+state and sum review counts
    const cityMap = new Map<string, { city: string; state: string; reviewCount: number }>()
    
    if (topCitiesData) {
      for (const prop of topCitiesData as Array<{ city: string; state: string; review_count: number }>) {
        const key = `${prop.city}, ${prop.state}`
        const existing = cityMap.get(key)
        if (existing) {
          existing.reviewCount += prop.review_count || 0
        } else {
          cityMap.set(key, {
            city: prop.city,
            state: prop.state,
            reviewCount: prop.review_count || 0,
          })
        }
      }
    }

    // Sort by review count and take top 8
    const topCities = Array.from(cityMap.values())
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 8)

    // Platform-wide "would rent again" percentage
    const { data: wouldRentAgainData, error: wouldRentAgainError } = await supabase
      .from('reviews')
      .select('would_rent_again')
      .not('would_rent_again', 'is', null)

    if (wouldRentAgainError) {
      throw wouldRentAgainError
    }

    const wouldRentAgainArray = (wouldRentAgainData || []) as Array<{ would_rent_again: boolean | null }>
    const totalWithWRA = wouldRentAgainArray.length
    const wouldRentAgainCount = wouldRentAgainArray.filter((r) => r.would_rent_again === true).length
    const wouldRentAgainPct = totalWithWRA > 0 ? Math.round((wouldRentAgainCount / totalWithWRA) * 100) : null

    return NextResponse.json({
      data: {
        totalProperties: totalProperties || 0,
        totalReviews: totalReviews || 0,
        recentReviews: recentReviews || 0,
        topCities,
        wouldRentAgainPct,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching homepage stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch homepage stats' },
      { status: 500 }
    )
  }
}
