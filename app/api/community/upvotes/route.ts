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
    const { post_id } = body

  if (!post_id) {
    return NextResponse.json({ error: 'Missing required field: post_id' }, { status: 400 })
  }

  // Check if upvote already exists
  const { data: existingUpvote, error: checkError } = await supabase
    .from('community_upvotes')
    .select('id')
    .eq('post_id', post_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 })
  }

  if (existingUpvote) {
    // Remove upvote (toggle off)
    const { error: deleteError } = await supabase
      .from('community_upvotes')
      .delete()
      .eq('id', (existingUpvote as { id: string }).id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ upvoted: false })
  } else {
    // Add upvote (toggle on)
    const { data, error: insertError } = await (supabase.from('community_upvotes') as any)
      .insert({
        post_id,
        user_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ upvoted: true, upvote: data })
    }
  } catch (error) {
    console.error('Error toggling upvote:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle upvote' },
      { status: 500 }
    )
  }
}
