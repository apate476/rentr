import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, body: commentBody } = body

  if (!post_id || !commentBody) {
    return NextResponse.json({ error: 'Missing required fields: post_id, body' }, { status: 400 })
  }

  // Validate length
  if (commentBody.length < 10 || commentBody.length > 1000) {
    return NextResponse.json({ error: 'Comment must be between 10 and 1000 characters' }, { status: 400 })
  }

  // Verify post exists
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .select('id')
    .eq('id', post_id)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const { data, error } = await (supabase.from('community_comments') as any)
    .insert({
      post_id,
      body: commentBody,
      user_id: user.id,
    })
    .select('*, profiles!inner(display_name)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to include author display name
  const comment = {
    ...data,
    author_display_name: (data.profiles as any)?.display_name || null,
    profiles: undefined,
  }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create comment' },
      { status: 500 }
    )
  }
}
