import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const boundsSchema = z.object({
  north: z.coerce.number(),
  south: z.coerce.number(),
  east: z.coerce.number(),
  west: z.coerce.number(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  // Parse and validate bounding box
  const boundsResult = boundsSchema.safeParse({
    north: searchParams.get('north'),
    south: searchParams.get('south'),
    east: searchParams.get('east'),
    west: searchParams.get('west'),
  })

  if (!boundsResult.success) {
    return NextResponse.json(
      { error: 'Invalid bounding box parameters. Required: north, south, east, west' },
      { status: 400 }
    )
  }

  const { north, south, east, west } = boundsResult.data

  // Fetch properties within bounding box
  const { data, error } = await supabase
    .from('properties')
    .select('id, address, city, state, lat, lng, avg_overall, review_count, property_type')
    .gt('review_count', 0) // Only show properties with reviews
    .gte('lat', south)
    .lte('lat', north)
    .gte('lng', west)
    .lte('lng', east)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
