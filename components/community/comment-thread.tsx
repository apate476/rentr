'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import type { CommentWithAuthor } from '@/types/community.types'

interface CommentThreadProps {
  comments: CommentWithAuthor[]
  currentUserId?: string
  onAddComment?: (body: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
}

export function CommentThread({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.length < 10 || !onAddComment) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-warm-text">
          Comments ({comments.length})
        </h3>
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full resize-none rounded-lg border border-warm-border bg-warm-card px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-text/20"
            minLength={10}
            maxLength={1000}
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-warm-muted">
              {newComment.length}/1000 {newComment.length < 10 && '(minimum 10 characters)'}
            </p>
            <Button
              type="submit"
              disabled={isSubmitting || newComment.length < 10}
              size="sm"
              className="rounded-lg bg-warm-text text-warm-card hover:bg-warm-text/90"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-warm-muted">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => {
            const authorName = comment.author_display_name || 'Anonymous Renter'
            const date = new Date(comment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            const canDelete = currentUserId === comment.user_id && onDeleteComment

            return (
              <div
                key={comment.id}
                className="rounded-lg border border-warm-border bg-warm-card p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-warm-muted">
                    <span className="font-medium text-warm-text">{authorName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {date}
                    </span>
                  </div>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment?.(comment.id)}
                      className="h-6 px-2 text-xs text-warm-muted hover:text-red-600"
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-warm-text">{comment.body}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
