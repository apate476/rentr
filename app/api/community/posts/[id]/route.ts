import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Get post with author info
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .select('*, profiles!inner(display_name)')
    .eq('id', id)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Get comments with author info
  const { data: comments } = await supabase
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postAny = post as any
  const postWithAuthor = {
    ...postAny,
    author_display_name: postAny.profiles?.display_name || null,
    has_upvoted: hasUpvoted,
    profiles: undefined,
  }

  // Transform comments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commentsWithAuthors = (comments || []).map((comment: any) => ({
    ...comment,
    author_display_name: comment.profiles?.display_name || null,
    profiles: undefined,
  }))

  return NextResponse.json({
    post: postWithAuthor,
    comments: commentsWithAuthors,
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, body: postBody, category } = body

    // Verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if ((existingPost as { user_id: string }).user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate if provided
    if (title && (title.length < 10 || title.length > 200)) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 200 characters' },
        { status: 400 }
      )
    }

    if (postBody && (postBody.length < 50 || postBody.length > 5000)) {
      return NextResponse.json(
        { error: 'Body must be between 50 and 5000 characters' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (title) updateData.title = title
    if (postBody) updateData.body = postBody
    if (category) updateData.category = category

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('community_posts') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership
  const { data: existingPost, error: fetchError } = await supabase
    .from('community_posts')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !existingPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if ((existingPost as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('community_posts').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
