import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PostCategory } from '@/types/community.types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  const city = searchParams.get('city')
  const state = searchParams.get('state')
  const category = searchParams.get('category') as PostCategory | null
  const sort = searchParams.get('sort') || 'newest'
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('community_posts')
    .select(
      'id, city, state, title, body, category, user_id, upvote_count, comment_count, created_at, updated_at, profiles!inner(display_name)'
    )
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (city && state) {
    query = query.eq('city', city).eq('state', state)
  }

  if (category) {
    query = query.eq('category', category)
  }

  // Apply sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'upvoted':
      query = query.order('upvote_count', { ascending: false })
      break
    case 'comments':
      query = query.order('comment_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to include author display name
  const posts = (data || []).map((post: any) => ({
    ...post,
    author_display_name: post.profiles?.display_name || null,
    profiles: undefined,
  }))

  return NextResponse.json({ posts })
}

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
    const { city, state, title, body: postBody, category } = body

  if (!city || !state || !title || !postBody || !category) {
    return NextResponse.json(
      { error: 'Missing required fields: city, state, title, body, category' },
      { status: 400 }
    )
  }

  // Validate category
  const validCategories = ['roommates', 'recommendations', 'landlord-warnings', 'housing-advice', 'general']
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  // Validate lengths
  if (title.length < 10 || title.length > 200) {
    return NextResponse.json({ error: 'Title must be between 10 and 200 characters' }, { status: 400 })
  }

  if (postBody.length < 50 || postBody.length > 5000) {
    return NextResponse.json({ error: 'Body must be between 50 and 5000 characters' }, { status: 400 })
  }

  const { data, error } = await (supabase.from('community_posts') as any)
    .insert({
      city,
      state,
      title,
      body: postBody,
      category,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}
