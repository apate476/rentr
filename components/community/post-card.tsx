'use client'

import Link from 'next/link'
import { MessageSquare, ArrowUp, Clock } from 'lucide-react'
import type { PostWithAuthor } from '@/types/community.types'
import { getCategoryLabel, getCategoryColor } from '@/lib/community/utils'
import { Button } from '@/components/ui/button'

interface PostCardProps {
  post: PostWithAuthor
  onUpvote?: (postId: string) => void
  showFullBody?: boolean
}

export function PostCard({ post, onUpvote, showFullBody = false }: PostCardProps) {
  const authorName = post.author_display_name || 'Anonymous Renter'
  const bodyPreview = showFullBody ? post.body : post.body.slice(0, 200) + (post.body.length > 200 ? '...' : '')
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block rounded-xl border border-warm-border bg-warm-card p-5 transition-all hover:shadow-md hover:border-warm-text/20"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(post.category)}`}
            >
              {getCategoryLabel(post.category)}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold text-warm-text group-hover:text-warm-text/80">
            {post.title}
          </h3>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-warm-muted">{bodyPreview}</p>

      <div className="flex items-center justify-between border-t border-warm-border pt-3">
        <div className="flex items-center gap-4 text-xs text-warm-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {date}
          </span>
          <span>{authorName}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onUpvote?.(post.id)
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              post.has_upvoted
                ? 'bg-warm-text text-warm-card'
                : 'bg-warm-secondary text-warm-muted hover:bg-warm-border'
            }`}
          >
            <ArrowUp className="h-3 w-3" />
            {post.upvote_count}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-warm-muted">
            <MessageSquare className="h-3 w-3" />
            {post.comment_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
