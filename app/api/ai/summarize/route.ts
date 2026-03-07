import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import { anthropic } from '@/lib/ai/client'
import { buildSummaryPrompt } from '@/lib/ai/prompts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: NextRequest) {
  const { property_id } = await req.json()
  if (!property_id) return NextResponse.json({ error: 'Missing property_id' }, { status: 400 })

  const cacheKey = `ai:summary:${property_id}`
  const cached = await redis.get<object>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      'body, score_overall, score_value, score_landlord, score_noise, score_pests, score_safety, score_parking, score_pets, score_neighborhood, would_rent_again, move_in_year, move_out_year, created_at'
    )
    .eq('property_id', property_id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ praised: [], issues: [], trend: null })
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: buildSummaryPrompt(reviews) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  let summary = { praised: [] as string[], issues: [] as string[], trend: null as string | null }
  try {
    summary = JSON.parse(text)
  } catch {
    // Return empty summary if parsing fails
  }

  await redis.setex(cacheKey, 60 * 60 * 24, JSON.stringify(summary))

  return NextResponse.json(summary)
}
