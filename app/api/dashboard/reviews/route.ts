import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { truncateText } from '@/lib/dashboard/utils'
import type { DashboardReview, ReviewPagination } from '@/types/dashboard.types'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(['newest', 'oldest', 'mostHelpful', 'leastHelpful', 'highestScore', 'lowestScore'])
    .optional()
    .default('newest'),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  scoreMin: z.coerce.number().min(1).max(5).optional(),
  scoreMax: z.coerce.number().min(1).max(5).optional(),
  location: z.string().optional(),
  propertyType: z.enum(['apartment', 'condo', 'house', 'townhouse', 'other']).optional(),
  minHelpfulVotes: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
})

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
    const result = querySchema.safeParse(Object.fromEntries(searchParams))

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: result.error.issues }, { status: 400 })
    }

    const { page, limit, sortBy, dateRangeStart, dateRangeEnd, scoreMin, scoreMax, location, propertyType, minHelpfulVotes, search } =
      result.data

    // Build base query for filtering
    let baseQuery = supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id)

    // Apply filters to count query
    if (dateRangeStart) {
      baseQuery = baseQuery.gte('created_at', dateRangeStart)
    }
    if (dateRangeEnd) {
      baseQuery = baseQuery.lte('created_at', dateRangeEnd)
    }
    if (scoreMin !== undefined) {
      baseQuery = baseQuery.gte('score_overall', scoreMin)
    }
    if (scoreMax !== undefined) {
      baseQuery = baseQuery.lte('score_overall', scoreMax)
    }
    if (minHelpfulVotes !== undefined) {
      baseQuery = baseQuery.gte('helpful_count', minHelpfulVotes)
    }
    if (search) {
      baseQuery = baseQuery.ilike('body', `%${search}%`)
    }

    // Get total count
    const { count } = await baseQuery

    // Build main query with data
    let query = supabase
      .from('reviews')
      .select(
        'id, score_overall, score_value, score_landlord, score_noise, score_pests, score_safety, score_parking, score_pets, score_neighborhood, body, helpful_count, created_at, move_in_year, move_out_year, would_rent_again, rent_amount, property_id, properties(id, address, city, state, zip, property_type, lat, lng)'
      )
      .eq('user_id', user.id)

    // Apply filters
    if (dateRangeStart) {
      query = query.gte('created_at', dateRangeStart)
    }
    if (dateRangeEnd) {
      query = query.lte('created_at', dateRangeEnd)
    }
    if (scoreMin !== undefined) {
      query = query.gte('score_overall', scoreMin)
    }
    if (scoreMax !== undefined) {
      query = query.lte('score_overall', scoreMax)
    }
    if (minHelpfulVotes !== undefined) {
      query = query.gte('helpful_count', minHelpfulVotes)
    }
    if (search) {
      query = query.ilike('body', `%${search}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'mostHelpful':
        query = query.order('helpful_count', { ascending: false })
        break
      case 'leastHelpful':
        query = query.order('helpful_count', { ascending: true })
        break
      case 'highestScore':
        query = query.order('score_overall', { ascending: false })
        break
      case 'lowestScore':
        query = query.order('score_overall', { ascending: true })
        break
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: reviews, error } = await query

    if (error) {
      throw error
    }

    // Get photo counts for each review
    const reviewsArray = (reviews || []) as Array<{
      id: string
      score_overall: number
      score_value: number
      score_landlord: number
      score_noise: number
      score_pests: number
      score_safety: number
      score_parking: number
      score_pets: number
      score_neighborhood: number
      body: string
      helpful_count: number
      created_at: string
      move_in_year: number | null
      move_out_year: number | null
      would_rent_again: boolean | null
      rent_amount: number | null
      property_id: string
      properties: Array<{
        id: string
        address: string
        city: string
        state: string
        zip: string | null
        property_type: string | null
        lat: number
        lng: number
      }> | {
        id: string
        address: string
        city: string
        state: string
        zip: string | null
        property_type: string | null
        lat: number
        lng: number
      }
    }>
    const reviewIds = reviewsArray.map((r) => r.id)
    const { data: photos } = await supabase
      .from('review_photos')
      .select('review_id')
      .in('review_id', reviewIds)

    const photoCounts = new Map<string, number>()
    const photosArray = (photos || []) as Array<{ review_id: string }>
    photosArray.forEach((p) => {
      photoCounts.set(p.review_id, (photoCounts.get(p.review_id) || 0) + 1)
    })

    // Transform to DashboardReview format
    const dashboardReviews: DashboardReview[] =
      reviewsArray
        .map((review) => {
          const property = Array.isArray(review.properties) ? review.properties[0] : review.properties
          if (!property || typeof property !== 'object' || !('id' in property)) {
            return null
          }

          // Apply location filter if specified
          if (location && !property.city?.toLowerCase().includes(location.toLowerCase()) && !property.state?.toLowerCase().includes(location.toLowerCase())) {
            return null
          }

          // Apply property type filter if specified
          if (propertyType && property.property_type !== propertyType) {
            return null
          }

          return {
            id: review.id,
            property: {
              id: property.id,
              address: property.address,
              city: property.city,
              state: property.state,
              zip: property.zip,
              propertyType: property.property_type,
              lat: property.lat,
              lng: property.lng,
            },
            scoreOverall: review.score_overall,
            scoreBreakdown: {
              value: review.score_value,
              landlord: review.score_landlord,
              noise: review.score_noise,
              pests: review.score_pests,
              safety: review.score_safety,
              parking: review.score_parking,
              pets: review.score_pets,
              neighborhood: review.score_neighborhood,
            },
            body: review.body,
            bodyExcerpt: truncateText(review.body, 150),
            helpfulVotes: review.helpful_count || 0,
            createdAt: review.created_at,
            moveInYear: review.move_in_year,
            moveOutYear: review.move_out_year,
            wouldRentAgain: review.would_rent_again,
            rentAmount: review.rent_amount,
            photoCount: photoCounts.get(review.id) || 0,
          }
        })
        .filter((r): r is DashboardReview => r !== null) || []

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    const pagination: ReviewPagination = {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    }

    return NextResponse.json({
      data: {
        reviews: dashboardReviews,
        pagination,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard reviews:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
