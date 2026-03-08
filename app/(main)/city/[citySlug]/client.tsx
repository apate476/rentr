'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PostCard } from '@/components/community/post-card'
import { CategoryFilter } from '@/components/community/category-filter'
import { PostForm } from '@/components/community/post-form'
import { Button } from '@/components/ui/button'
import { createCitySlug } from '@/lib/community/utils'
import type { PostCategory, PostWithAuthor } from '@/types/community.types'

interface CityCommunityClientProps {
  city: string
  state: string
  initialPosts: PostWithAuthor[]
  initialCategory: PostCategory | null
  initialSort: string
  isAuthenticated: boolean
}

export function CityCommunityClient({
  city,
  state,
  initialPosts,
  initialCategory,
  initialSort,
  isAuthenticated,
}: CityCommunityClientProps) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(initialCategory)
  const [sort, setSort] = useState(initialSort)
  const [showPostForm, setShowPostForm] = useState(false)

  const citySlug = createCitySlug(city, state)

  const handleCategoryChange = (category: PostCategory | null) => {
    setSelectedCategory(category)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (sort !== 'newest') params.set('sort', sort)
    router.push(`/city/${citySlug}?${params.toString()}`)
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (newSort !== 'newest') params.set('sort', newSort)
    router.push(`/city/${citySlug}?${params.toString()}`)
  }

  const handleUpvote = async (postId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=/city/${citySlug}`)
      return
    }

    try {
      const response = await fetch('/api/community/upvotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      })

      if (response.ok) {
        const { upvoted } = await response.json()
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  has_upvoted: upvoted,
                  upvote_count: upvoted ? post.upvote_count + 1 : post.upvote_count - 1,
                }
              : post
          )
        )
      }
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const handlePostSubmit = async (data: {
    title: string
    body: string
    category: PostCategory
  }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          state,
          title: data.title,
          body: data.body,
          category: data.category,
        }),
      })

      if (response.ok) {
        const { post } = await response.json()
        setPosts([post, ...posts])
        setShowPostForm(false)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex items-center gap-2">
          <span className="text-warm-muted text-sm">Sort:</span>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border-warm-border bg-warm-card text-warm-text focus:ring-warm-text/20 rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="upvoted">Most Upvoted</option>
            <option value="comments">Most Comments</option>
          </select>
        </div>
      </div>

      {/* Create Post Button/Form */}
      {isAuthenticated ? (
        showPostForm ? (
          <PostForm
            city={city}
            state={state}
            onSubmit={handlePostSubmit}
            onCancel={() => setShowPostForm(false)}
          />
        ) : (
          <Button
            onClick={() => setShowPostForm(true)}
            className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full rounded-lg sm:w-auto"
          >
            Create Post
          </Button>
        )
      ) : (
        <Button
          onClick={() => router.push(`/login?redirectTo=/city/${citySlug}`)}
          className="bg-warm-text text-warm-card hover:bg-warm-text/90 w-full rounded-lg sm:w-auto"
        >
          Sign in to create a post
        </Button>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="border-warm-border bg-warm-card rounded-xl border p-12 text-center">
          <p className="text-warm-muted">No posts yet. Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpvote={handleUpvote} />
          ))}
        </div>
      )}
    </div>
  )
}
