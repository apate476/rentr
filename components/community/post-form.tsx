'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { POST_CATEGORIES, type PostCategory } from '@/types/community.types'
import { getCategoryColor } from '@/lib/community/utils'

interface PostFormProps {
  city: string
  state: string
  onSubmit: (data: { title: string; body: string; category: PostCategory }) => Promise<void>
  onCancel?: () => void
}

export function PostForm({ city, state, onSubmit, onCancel }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<PostCategory>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.length < 10 || body.length < 50) return

    setIsSubmitting(true)
    try {
      await onSubmit({ title, body, category })
      setTitle('')
      setBody('')
      setCategory('general')
    } catch (error) {
      console.error('Error submitting post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-warm-border bg-warm-card space-y-5 rounded-xl border p-6"
    >
      <div>
        <h2 className="font-display text-warm-text text-xl font-semibold">Create a post</h2>
        <p className="text-warm-muted mt-1 text-sm">
          Share your experience, ask questions, or help other renters in {city}, {state}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-warm-text">
          Category
        </Label>
        <div className="flex flex-wrap gap-2">
          {POST_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                category === cat.value
                  ? `${getCategoryColor(cat.value)} border-2`
                  : 'border-warm-border bg-warm-card text-warm-muted hover:border-warm-text/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-warm-text">
          Title <span className="text-warm-muted">(10-200 characters)</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Looking for roommate in downtown area"
          className="border-warm-border rounded-lg"
          minLength={10}
          maxLength={200}
          required
        />
        <p className="text-warm-muted text-xs">
          {title.length}/200 {title.length < 10 && '(minimum 10 characters)'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-warm-text">
          Content <span className="text-warm-muted">(50-5000 characters)</span>
        </Label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience, ask questions, or provide advice..."
          rows={6}
          className="border-warm-border bg-warm-card text-warm-text placeholder:text-warm-muted focus:ring-warm-text/20 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          minLength={50}
          maxLength={5000}
          required
        />
        <p className="text-warm-muted text-xs">
          {body.length}/5000 {body.length < 50 && '(minimum 50 characters)'}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="text-warm-muted">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || title.length < 10 || body.length < 50}
          className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  )
}
