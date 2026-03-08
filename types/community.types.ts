export type PostCategory =
  | 'roommates'
  | 'recommendations'
  | 'landlord-warnings'
  | 'housing-advice'
  | 'general'

export interface CommunityPost {
  id: string
  city: string
  state: string
  title: string
  body: string
  category: PostCategory
  user_id: string
  upvote_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

export interface CommunityUpvote {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface CityStats {
  city: string
  state: string
  property_count: number
  post_count: number
  review_count: number
}

export interface PostWithAuthor extends CommunityPost {
  author_display_name: string | null
  has_upvoted?: boolean
}

export interface CommentWithAuthor extends CommunityComment {
  author_display_name: string | null
}

export const POST_CATEGORIES: { value: PostCategory; label: string; description: string }[] = [
  {
    value: 'roommates',
    label: 'Roommates',
    description: 'Looking for or sharing about roommates',
  },
  {
    value: 'recommendations',
    label: 'Recommendations',
    description: 'Apartment and area recommendations',
  },
  {
    value: 'landlord-warnings',
    label: 'Landlord Warnings',
    description: 'Warnings about problematic landlords',
  },
  {
    value: 'housing-advice',
    label: 'Housing Advice',
    description: 'General housing and rental advice',
  },
  {
    value: 'general',
    label: 'General Discussion',
    description: 'General renter community discussion',
  },
]
