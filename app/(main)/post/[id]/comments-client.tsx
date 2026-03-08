'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommentThread } from '@/components/community/comment-thread'
import type { CommentWithAuthor } from '@/types/community.types'

interface PostCommentsClientProps {
  postId: string
  initialComments: CommentWithAuthor[]
  currentUserId?: string
}

export function PostCommentsClient({ postId, initialComments, currentUserId }: PostCommentsClientProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddComment = async (body: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, body }),
      })

      if (response.ok) {
        const { comment } = await response.json()
        setComments([...comments, comment])
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
        router.refresh()
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  return (
    <CommentThread
      comments={comments}
      currentUserId={currentUserId}
      onAddComment={handleAddComment}
      onDeleteComment={handleDeleteComment}
    />
  )
}
