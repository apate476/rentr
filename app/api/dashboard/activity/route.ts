import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ActivityTimelineData } from '@/types/dashboard.types'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl
    const period = (searchParams.get('period') as '7d' | '30d' | '90d' | '1y' | 'all') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = null
        break
    }

    // Fetch reviews
    let query = supabase.from('reviews').select('created_at').eq('user_id', user.id)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: reviews, error } = await query.order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Group by date
    const dateMap = new Map<string, number>()
    const reviewsArray = (reviews || []) as Array<{ created_at: string }>
    reviewsArray.forEach((review) => {
      const date = new Date(review.created_at).toISOString().split('T')[0] // YYYY-MM-DD
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })

    // Convert to array and sort
    const timeline = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Find peak activity
    const peakActivity = timeline.reduce(
      (peak, current) => (current.count > peak.count ? current : peak),
      timeline[0] || { date: '', count: 0 }
    )

    // Calculate average per period
    const totalInPeriod = timeline.reduce((sum, item) => sum + item.count, 0)
    const averagePerPeriod = timeline.length > 0 ? totalInPeriod / timeline.length : 0

    // Determine trend (compare first half to second half)
    const midpoint = Math.floor(timeline.length / 2)
    const firstHalf = timeline.slice(0, midpoint).reduce((sum, item) => sum + item.count, 0)
    const secondHalf = timeline.slice(midpoint).reduce((sum, item) => sum + item.count, 0)
    const trend =
      firstHalf === 0 && secondHalf === 0
        ? 'stable'
        : secondHalf > firstHalf
          ? 'increasing'
          : secondHalf < firstHalf
            ? 'decreasing'
            : 'stable'

    const data: ActivityTimelineData = {
      timeline,
      peakActivity,
      averagePerPeriod: Math.round(averagePerPeriod * 10) / 10,
      trend,
      totalInPeriod,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch activity data' },
      { status: 500 }
    )
  }
}
