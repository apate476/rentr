'use client'

// Dashboard Data Fetching Hooks
// Using native fetch with React state (can be upgraded to React Query/SWR later)

import { useState, useEffect } from 'react'
import type {
  DashboardStats,
  DashboardReview,
  ReviewPagination,
  ActivityTimelineData,
  CommunityImpact,
  ReviewFilters,
} from '@/types/dashboard.types'

interface UseDashboardStatsResult {
  data: DashboardStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}

interface UseDashboardReviewsResult {
  reviews: DashboardReview[]
  pagination: ReviewPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardReviews(filters: ReviewFilters = {}): UseDashboardReviewsResult {
  const [reviews, setReviews] = useState<DashboardReview[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (filters.dateRangeStart) params.set('dateRangeStart', filters.dateRangeStart)
      if (filters.dateRangeEnd) params.set('dateRangeEnd', filters.dateRangeEnd)
      if (filters.scoreMin) params.set('scoreMin', filters.scoreMin.toString())
      if (filters.scoreMax) params.set('scoreMax', filters.scoreMax.toString())
      if (filters.location) params.set('location', filters.location)
      if (filters.propertyType) params.set('propertyType', filters.propertyType)
      if (filters.minHelpfulVotes) params.set('minHelpfulVotes', filters.minHelpfulVotes.toString())
      if (filters.search) params.set('search', filters.search)

      const response = await fetch(`/api/dashboard/reviews?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      setReviews(result.data.reviews || [])
      setPagination(result.data.pagination || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.dateRangeStart,
    filters.dateRangeEnd,
    filters.scoreMin,
    filters.scoreMax,
    filters.location,
    filters.propertyType,
    filters.minHelpfulVotes,
    filters.search,
  ])

  return { reviews, pagination, isLoading, error, refetch: fetchData }
}

interface UseDashboardActivityResult {
  data: ActivityTimelineData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardActivity(period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'): UseDashboardActivityResult {
  const [data, setData] = useState<ActivityTimelineData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dashboard/activity?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch activity data')
      }
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  return { data, isLoading, error, refetch: fetchData }
}

interface UseDashboardImpactResult {
  data: CommunityImpact | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardImpact(): UseDashboardImpactResult {
  const [data, setData] = useState<CommunityImpact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/impact')
      if (!response.ok) {
        throw new Error('Failed to fetch impact data')
      }
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}
