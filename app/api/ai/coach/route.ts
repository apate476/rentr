import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/ai/client'
import { buildWritingCoachPrompt } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { body, scores } = await req.json()
  if (!body || body.length < 50) return NextResponse.json({ suggestions: [] })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{ role: 'user', content: buildWritingCoachPrompt(body, scores) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  let suggestions: string[] = []
  try {
    suggestions = JSON.parse(text)
    if (!Array.isArray(suggestions)) suggestions = []
  } catch {
    suggestions = []
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 2) })
}
