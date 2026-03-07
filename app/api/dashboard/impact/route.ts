import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTrend, calculateImpactScore, calculatePercentile, type Trend } from '@/lib/dashboard/utils'
import type { CommunityImpact } from '@/types/dashboard.types'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, helpful_count, created_at')
      .eq('user_id', user.id)

    if (reviewsError) {
      throw reviewsError
    }

    const reviewsArray = (reviews || []) as Array<{ id: string; helpful_count: number; created_at: string }>
    const totalHelpfulVotes = reviewsArray.reduce((sum, r) => sum + (r.helpful_count || 0), 0)
    const totalReviews = reviewsArray.length
    const reviewsWithVotes = reviewsArray.filter((r) => (r.helpful_count || 0) > 0).length
    const reviewsWithVotesPercentage = totalReviews > 0 ? reviewsWithVotes / totalReviews : 0
    const averageHelpfulVotesPerReview = totalReviews > 0 ? totalHelpfulVotes / totalReviews : 0

    // Helpful votes trend
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentVotes = reviewsArray.filter((r) => new Date(r.created_at) >= last30Days).reduce((sum, r) => sum + (r.helpful_count || 0), 0)
    const previousVotes = reviewsArray.filter((r) => {
      const date = new Date(r.created_at)
      return date >= previous30Days && date < last30Days
    }).reduce((sum, r) => sum + (r.helpful_count || 0), 0)

    const helpfulVotesTrend = calculateTrend(recentVotes, previousVotes)

    // Pioneer properties
    const { data: pioneerProperties, error: pioneerError } = await supabase
      .from('properties')
      .select('id, city, state')
      .eq('created_by', user.id)

    if (pioneerError) {
      throw pioneerError
    }

    const pioneerArray = (pioneerProperties || []) as Array<{ id: string; city: string; state: string }>
    const pioneerCount = pioneerArray.length

    // Pioneer cities
    const cityMap = new Map<string, { city: string; state: string; count: number }>()
    pioneerArray.forEach((p) => {
      const key = `${p.city}-${p.state}`
      const existing = cityMap.get(key)
      if (existing) {
        existing.count++
      } else {
        cityMap.set(key, { city: p.city, state: p.state, count: 1 })
      }
    })
    const pioneerCities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count)

    // Calculate impact score
    const impactScore = calculateImpactScore(totalHelpfulVotes, pioneerCount, reviewsWithVotes, totalReviews)

    // Calculate rank percentile (compare to all users)
    const { data: allUserStats } = await supabase
      .from('reviews')
      .select('user_id, helpful_count')
      .not('user_id', 'is', null)

    const userTotals = new Map<string, number>()
    const allStatsArray = (allUserStats || []) as Array<{ user_id: string; helpful_count: number }>
    allStatsArray.forEach((r) => {
      const current = userTotals.get(r.user_id) || 0
      userTotals.set(r.user_id, current + (r.helpful_count || 0))
    })

    const allTotals = Array.from(userTotals.values())
    const rankPercentile = calculatePercentile(totalHelpfulVotes, allTotals)

    // Estimated users helped (rough calculation: helpful votes / 10)
    const estimatedUsersHelped = Math.round(totalHelpfulVotes / 10)

    const impact: CommunityImpact = {
      totalHelpfulVotes,
      averageHelpfulVotesPerReview: Math.round(averageHelpfulVotesPerReview * 10) / 10,
      helpfulVotesTrend,
      impactScore,
      rankPercentile,
      pioneerProperties: pioneerCount,
      pioneerCities,
      estimatedUsersHelped,
      reviewsWithVotes,
      reviewsWithVotesPercentage,
    }

    return NextResponse.json({ data: impact })
  } catch (error) {
    console.error('Error fetching dashboard impact:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch impact data' },
      { status: 500 }
    )
  }
}
