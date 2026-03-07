// Dashboard TypeScript Types
// Based on Step 3: API Contracts & Data Models

export interface Trend {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
  period: string
}

export interface DashboardStats {
  totalReviews: number
  totalHelpfulVotes: number
  helpfulVotesTrend: Trend
  propertiesReviewed: number
  communityImpactScore: number
  memberSince: string
  tenureMonths: number
  averageScoreGiven: number | null
  reviewsWithVotes: number
  reviewsWithVotesPercentage: number
  pioneerProperties: number
}

export interface PropertySummary {
  id: string
  address: string
  city: string
  state: string
  zip: string | null
  propertyType: string | null
  lat: number
  lng: number
}

export interface ScoreBreakdown {
  value: number
  landlord: number
  noise: number
  pests: number
  safety: number
  parking: number
  pets: number
  neighborhood: number
}

export interface DashboardReview {
  id: string
  property: PropertySummary
  scoreOverall: number
  scoreBreakdown: ScoreBreakdown
  body: string
  bodyExcerpt: string
  helpfulVotes: number
  helpfulVotesTrend?: number
  createdAt: string
  moveInYear: number | null
  moveOutYear: number | null
  wouldRentAgain: boolean | null
  rentAmount: number | null
  photoCount: number
}

export interface ReviewPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ActivityTimelineData {
  timeline: Array<{
    date: string
    count: number
  }>
  peakActivity: {
    date: string
    count: number
  }
  averagePerPeriod: number
  trend: 'increasing' | 'decreasing' | 'stable'
  totalInPeriod: number
}

export interface CommunityImpact {
  totalHelpfulVotes: number
  averageHelpfulVotesPerReview: number
  helpfulVotesTrend: Trend
  impactScore: number
  rankPercentile: number
  pioneerProperties: number
  pioneerCities: Array<{ city: string; state: string; count: number }>
  estimatedUsersHelped: number
  reviewsWithVotes: number
  reviewsWithVotesPercentage: number
}

export interface ReviewPatterns {
  mostCommonScore: number
  reviewFrequency: 'increasing' | 'decreasing' | 'stable'
  categoryFocus: Array<{
    category: string
    averageScore: number
    reviewCount: number
  }>
  averageScoresGiven: ScoreBreakdown
  wouldRentAgainPercentage: number | null
}

export interface Opportunity {
  type: 'property' | 'city' | 'category'
  title: string
  description: string
  actionUrl: string
  priority: 'high' | 'medium' | 'low'
  metadata?: Record<string, unknown>
}

export interface TrendMetric {
  metric: string
  current: number
  previous: number
  change: number
  period: string
  direction: 'up' | 'down' | 'neutral'
}

export interface DashboardInsights {
  patterns: ReviewPatterns
  opportunities: Opportunity[]
  trends: TrendMetric[]
}

export interface SavedProperty {
  id: string
  address: string
  city: string
  state: string
  zip: string | null
  propertyType: string | null
  avgOverall: number | null
  reviewCount: number
  savedAt: string
  lastVisitedAt: string | null
  newReviewsSinceLastVisit: number
  scoreChangeSinceSaved: number | null
  hasNewActivity: boolean
}

export interface ReviewFilters {
  page?: number
  limit?: number
  sortBy?: 'newest' | 'oldest' | 'mostHelpful' | 'leastHelpful' | 'highestScore' | 'lowestScore'
  dateRangeStart?: string
  dateRangeEnd?: string
  scoreMin?: number
  scoreMax?: number
  location?: string
  propertyType?: 'apartment' | 'condo' | 'house' | 'townhouse' | 'other'
  minHelpfulVotes?: number
  search?: string
}
