import { NextRequest } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/ai/client'
import { buildChatSystemPrompt } from '@/lib/ai/prompts'
import { checkUsage, incrementUsage } from '@/lib/ai/usage'
import { AI_FREE_CHATS_PER_MONTH } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await admin
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()
    const isPremium = profile?.is_premium ?? false

    const { allowed, remaining } = await checkUsage(user.id, isPremium)
    if (!allowed) {
      return new Response('Usage limit reached', {
        status: 429,
        headers: { 'X-Remaining-Chats': '0' },
      })
    }

    const { message, conversationHistory, property_id } = await req.json()

    // Build property context if on a property page
    let propertyContext = null
    if (property_id) {
      const [{ data: property }, { data: reviews }] = await Promise.all([
        admin.from('properties').select('address, city, state').eq('id', property_id).single(),
        admin
          .from('reviews')
          .select(
            'body, score_overall, score_value, score_landlord, score_noise, score_pests, score_safety, score_parking, score_pets, score_neighborhood, would_rent_again, move_in_year, move_out_year, created_at'
          )
          .eq('property_id', property_id)
          .order('created_at', { ascending: false })
          .limit(15),
      ])
      if (property && reviews) {
        propertyContext = { ...property, reviews }
      }
    }

    const systemPrompt = buildChatSystemPrompt(propertyContext)
    const messages = [
      ...(conversationHistory as { role: 'user' | 'assistant'; content: string }[]),
      { role: 'user' as const, content: message },
    ]

    await incrementUsage(user.id)
    const newRemaining = isPremium ? AI_FREE_CHATS_PER_MONTH : Math.max(0, remaining - 1)

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        stream.on('text', (text) => {
          controller.enqueue(new TextEncoder().encode(text))
        })
        await stream.finalMessage()
        controller.close()
      },
      cancel() {
        stream.abort()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Remaining-Chats': String(newRemaining),
      },
    })
  } catch (error) {
    console.error('Error in AI chat:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
