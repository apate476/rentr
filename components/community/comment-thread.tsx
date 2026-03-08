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
        <h3 className="font-display text-warm-text text-lg font-semibold">
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
            className="border-warm-border bg-warm-card text-warm-text placeholder:text-warm-muted focus:ring-warm-text/20 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            minLength={10}
            maxLength={1000}
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-warm-muted text-xs">
              {newComment.length}/1000 {newComment.length < 10 && '(minimum 10 characters)'}
            </p>
            <Button
              type="submit"
              disabled={isSubmitting || newComment.length < 10}
              size="sm"
              className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-warm-muted text-sm">No comments yet. Be the first to comment!</p>
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
                className="border-warm-border bg-warm-card rounded-lg border p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-warm-muted flex items-center gap-2 text-xs">
                    <span className="text-warm-text font-medium">{authorName}</span>
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
                      className="text-warm-muted h-6 px-2 text-xs hover:text-red-600"
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <p className="text-warm-text text-sm leading-relaxed">{comment.body}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
