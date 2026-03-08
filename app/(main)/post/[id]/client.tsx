'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PostDetailClientProps {
  postId: string
  initialUpvoted: boolean
  initialUpvoteCount: number
}

export function PostDetailClient({
  postId,
  initialUpvoted,
  initialUpvoteCount,
}: PostDetailClientProps) {
  const router = useRouter()
  const [upvoted, setUpvoted] = useState(initialUpvoted)
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpvote = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirectTo=/post/${postId}`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/community/upvotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      })

      if (response.ok) {
        const { upvoted: newUpvoted } = await response.json()
        setUpvoted(newUpvoted)
        setUpvoteCount((prev) => (newUpvoted ? prev + 1 : prev - 1))
      }
    } catch (error) {
      console.error('Error upvoting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        upvoted
          ? 'bg-warm-text text-warm-card'
          : 'bg-warm-secondary text-warm-muted hover:bg-warm-border'
      }`}
    >
      <ArrowUp className="h-4 w-4" />
      {upvoteCount}
    </button>
  )
}
