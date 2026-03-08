import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CommentThread } from '@/components/community/comment-thread'
import { getCategoryLabel, getCategoryColor, createCitySlug } from '@/lib/community/utils'
import { PostDetailClient } from './client'
import { PostCommentsClient } from './comments-client'
import type { PostWithAuthor, CommentWithAuthor } from '@/types/community.types'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get post with author info
  const { data: postData, error: postError } = await supabase
    .from('community_posts')
    .select('*, profiles!inner(display_name)')
    .eq('id', id)
    .single()

  if (postError || !postData) {
    notFound()
  }

  // Get comments with author info
  const { data: commentsData } = await supabase
    .from('community_comments')
    .select('*, profiles!inner(display_name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // Check if current user has upvoted
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let hasUpvoted = false
  if (user) {
    const { data: upvote } = await supabase
      .from('community_upvotes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    hasUpvoted = !!upvote
  }

  // Transform post
  const postDataAny = postData as any
  const post: PostWithAuthor = {
    ...postDataAny,
    author_display_name: postDataAny.profiles?.display_name || null,
    has_upvoted: hasUpvoted,
  }

  // Transform comments
  const comments: CommentWithAuthor[] = (commentsData || []).map((comment: any) => ({
    ...comment,
    author_display_name: comment.profiles?.display_name || null,
  }))

  const citySlug = createCitySlug(post.city, post.state)
  const authorName = post.author_display_name || 'Anonymous Renter'
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/city/${citySlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-warm-muted transition-colors hover:text-warm-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {post.city}, {post.state} community
      </Link>

      <div className="mb-6 rounded-xl border border-warm-border bg-warm-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getCategoryColor(post.category)}`}
          >
            {getCategoryLabel(post.category)}
          </span>
        </div>

        <h1 className="mb-4 font-display text-3xl font-bold text-warm-text">{post.title}</h1>

        <div className="mb-6 flex items-center gap-4 text-sm text-warm-muted">
          <span>{authorName}</span>
          <span>·</span>
          <span>{date}</span>
        </div>

        <div className="prose prose-sm max-w-none text-warm-text">
          <p className="whitespace-pre-wrap leading-relaxed">{post.body}</p>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-warm-border pt-4">
          <PostDetailClient postId={post.id} initialUpvoted={post.has_upvoted ?? false} initialUpvoteCount={post.upvote_count ?? 0} />
          <div className="flex items-center gap-2 text-sm text-warm-muted">
            <MessageSquare className="h-4 w-4" />
            {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      </div>

      <PostCommentsClient postId={id} initialComments={comments} currentUserId={user?.id} />
    </div>
  )
}
