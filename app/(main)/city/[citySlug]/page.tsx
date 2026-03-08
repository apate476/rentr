import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseCitySlug } from '@/lib/community/utils'
import { CityHeader } from '@/components/community/city-header'
import { CityCommunityClient } from './client'
import type { PostCategory } from '@/types/community.types'
import type { CityStats } from '@/types/community.types'

interface CityPageProps {
  params: Promise<{ citySlug: string }>
  searchParams: Promise<{ category?: string; sort?: string }>
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const { citySlug } = await params
  const { category, sort = 'newest' } = await searchParams

  const cityInfo = parseCitySlug(citySlug)
  if (!cityInfo) {
    notFound()
  }

  const { city, state } = cityInfo
  const supabase = await createClient()

  // Get city stats
  // First get property IDs in this city
  const { data: cityProperties } = await supabase
    .from('properties')
    .select('id')
    .eq('city', city)
    .eq('state', state)

  const propertyIds = (cityProperties || []).map((p: { id: string }) => p.id)

  const [propertiesResult, postsResult, reviewsResult] = await Promise.all([
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('city', city)
      .eq('state', state),
    supabase
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('city', city)
      .eq('state', state),
    propertyIds.length > 0
      ? supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds)
      : { count: 0, error: null },
  ])

  const stats: CityStats = {
    city,
    state,
    property_count: propertiesResult.count || 0,
    post_count: postsResult.count || 0,
    review_count: reviewsResult.count || 0,
  }

  // Get posts
  let postsQuery = supabase
    .from('community_posts')
    .select('*, profiles!inner(display_name)')
    .eq('city', city)
    .eq('state', state)
    .limit(20)

  if (category) {
    postsQuery = postsQuery.eq('category', category)
  }

  switch (sort) {
    case 'newest':
      postsQuery = postsQuery.order('created_at', { ascending: false })
      break
    case 'upvoted':
      postsQuery = postsQuery.order('upvote_count', { ascending: false })
      break
    case 'comments':
      postsQuery = postsQuery.order('comment_count', { ascending: false })
      break
  }

  const { data: postsData } = await postsQuery

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's upvotes if logged in
  let userUpvotes: Set<string> = new Set()
  if (user) {
    const { data: upvotes } = await supabase
      .from('community_upvotes')
      .select('post_id')
      .eq('user_id', user.id)

    if (upvotes) {
      userUpvotes = new Set(upvotes.map((u: { post_id: string }) => u.post_id))
    }
  }

  // Transform posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = (postsData || []).map((post: any) => ({
    ...post,
    author_display_name: post.profiles?.display_name || null,
    has_upvoted: userUpvotes.has(post.id),
    profiles: undefined,
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <CityHeader city={city} state={state} stats={stats} />

      <CityCommunityClient
        city={city}
        state={state}
        initialPosts={posts}
        initialCategory={(category as PostCategory) || null}
        initialSort={sort}
        isAuthenticated={!!user}
      />
    </div>
  )
}
