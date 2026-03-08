import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTrend, calculateMonthsBetween, calculateImpactScore } from '@/lib/dashboard/utils'
import type { DashboardStats } from '@/types/dashboard.types'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's profile to find member since date
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single()
    const profileData = profile as { created_at: string } | null

    // Total reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, score_overall, helpful_count, created_at')
      .eq('user_id', user.id)

    if (reviewsError) {
      throw reviewsError
    }

    const reviewsArray = (reviews || []) as Array<{
      id: string
      score_overall: number
      helpful_count: number
      created_at: string
    }>
    const totalReviews = reviewsArray.length

    // Total helpful votes
    const totalHelpfulVotes = reviewsArray.reduce((sum, r) => sum + (r.helpful_count || 0), 0)

    // Helpful votes trend (compare last 30 days to previous 30 days)
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentVotes = reviewsArray
      .filter((r) => new Date(r.created_at) >= last30Days)
      .reduce((sum, r) => sum + (r.helpful_count || 0), 0)
    const previousVotes = reviewsArray
      .filter((r) => {
        const date = new Date(r.created_at)
        return date >= previous30Days && date < last30Days
      })
      .reduce((sum, r) => sum + (r.helpful_count || 0), 0)

    const helpfulVotesTrend = calculateTrend(recentVotes, previousVotes)

    // Unique properties reviewed
    const { data: uniqueProperties, error: propertiesError } = await supabase
      .from('reviews')
      .select('property_id')
      .eq('user_id', user.id)

    if (propertiesError) {
      throw propertiesError
    }

    const propertiesArray = (uniqueProperties || []) as Array<{ property_id: string }>
    const propertiesReviewed = new Set(propertiesArray.map((p) => p.property_id)).size

    // Pioneer properties (properties user was first to review)
    const { data: pioneerProperties, error: pioneerError } = await supabase
      .from('properties')
      .select('id')
      .eq('created_by', user.id)

    if (pioneerError) {
      throw pioneerError
    }

    const pioneerCount = pioneerProperties?.length || 0

    // Average score given
    const avgScore =
      reviewsArray.length > 0
        ? reviewsArray.reduce((sum, r) => sum + r.score_overall, 0) / reviewsArray.length
        : null

    // Reviews with votes
    const reviewsWithVotes = reviewsArray.filter((r) => (r.helpful_count || 0) > 0).length
    const reviewsWithVotesPercentage = totalReviews > 0 ? reviewsWithVotes / totalReviews : 0

    // Member since and tenure
    const memberSince = profileData?.created_at || user.created_at
    const tenureMonths = calculateMonthsBetween(memberSince)

    // Community impact score
    const communityImpactScore = calculateImpactScore(
      totalHelpfulVotes,
      pioneerCount,
      reviewsWithVotes,
      totalReviews
    )

    const stats: DashboardStats = {
      totalReviews,
      totalHelpfulVotes,
      helpfulVotesTrend,
      propertiesReviewed,
      communityImpactScore,
      memberSince,
      tenureMonths,
      averageScoreGiven: avgScore,
      reviewsWithVotes,
      reviewsWithVotesPercentage,
      pioneerProperties: pioneerCount,
    }

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
