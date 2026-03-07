import { Redis } from '@upstash/redis'
import { AI_FREE_CHATS_PER_MONTH } from '@/lib/constants'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

function getKey(userId: string): string {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return `ai:chat:${userId}:${month}`
}

function secondsUntilEndOfMonth(): number {
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.ceil((endOfMonth.getTime() - now.getTime()) / 1000)
}

export async function checkUsage(
  userId: string,
  isPremium: boolean
): Promise<{ allowed: boolean; remaining: number }> {
  if (isPremium) return { allowed: true, remaining: Infinity }

  const key = getKey(userId)
  const count = (await redis.get<number>(key)) ?? 0
  const remaining = Math.max(0, AI_FREE_CHATS_PER_MONTH - count)
  return { allowed: remaining > 0, remaining }
}

export async function incrementUsage(userId: string): Promise<void> {
  const key = getKey(userId)
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, secondsUntilEndOfMonth())
  }
}
