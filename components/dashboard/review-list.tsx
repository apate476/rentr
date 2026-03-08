'use client'

import { useState } from 'react'
import { useDashboardReviews } from '@/lib/dashboard/hooks'
import { ReviewCard } from './review-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReviewFilters } from '@/types/dashboard.types'

export function ReviewList() {
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 20,
    sortBy: 'newest',
  })

  const { reviews, pagination, isLoading, error } = useDashboardReviews(filters)

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as ReviewFilters['sortBy'], page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  if (error) {
    return (
      <div className="border-warm-border bg-warm-card text-warm-muted rounded-2xl border p-6 text-center">
        <p>Failed to load reviews: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-warm-text font-display text-xl font-bold">My Reviews</h2>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="mostHelpful">Most helpful</SelectItem>
            <SelectItem value="leastHelpful">Least helpful</SelectItem>
            <SelectItem value="highestScore">Highest score</SelectItem>
            <SelectItem value="lowestScore">Lowest score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="bg-warm-secondary h-[120px] w-full rounded-xl" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-warm-muted text-sm">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="border-warm-border bg-warm-card rounded-2xl border p-12 text-center">
          <p className="font-display text-warm-text mb-2 text-lg">No reviews yet</p>
          <p className="text-warm-muted mb-6 text-sm">
            Start helping other renters by sharing your experience
          </p>
          <Button asChild className="bg-warm-text text-warm-card hover:bg-warm-text/90">
            <a href="/review/new">Write your first review</a>
          </Button>
        </div>
      )}
    </div>
  )
}
