'use client'

import { useDashboardStats } from '@/lib/dashboard/hooks'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import { ReviewList } from '@/components/dashboard/review-list'
import { ImpactCard } from '@/components/dashboard/impact-card'
import { FileText, ThumbsUp, MapPin, Award } from 'lucide-react'
import { formatScore } from '@/lib/dashboard/utils'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()

  return (
    <div className="container mx-auto max-w-7xl p-4 lg:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-warm-text font-display mb-2">Dashboard</h1>
        <p className="text-warm-muted">Your review activity and community impact</p>
      </div>

      {/* Executive Summary - 4 StatsCards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Reviews"
            value={stats?.totalReviews || 0}
            trend={stats?.helpfulVotesTrend}
            icon={<FileText className="h-5 w-5" />}
            isLoading={statsLoading}
          />
          <StatsCard
            label="Helpful Votes"
            value={stats?.totalHelpfulVotes || 0}
            trend={stats?.helpfulVotesTrend}
            icon={<ThumbsUp className="h-5 w-5" />}
            isLoading={statsLoading}
          />
          <StatsCard
            label="Properties Reviewed"
            value={stats?.propertiesReviewed || 0}
            icon={<MapPin className="h-5 w-5" />}
            isLoading={statsLoading}
          />
          <StatsCard
            label="Average Score Given"
            value={stats?.averageScoreGiven ? formatScore(stats.averageScoreGiven) : 'N/A'}
            icon={<Award className="h-5 w-5" />}
            isLoading={statsLoading}
          />
        </div>
      </section>

      {/* Activity Timeline */}
      <section>
        <ActivityTimeline />
      </section>

      {/* My Reviews & Community Impact */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Reviews - 2/3 width */}
          <div className="lg:col-span-2">
            <ReviewList />
          </div>

          {/* Community Impact - 1/3 width, sticky */}
          <div className="lg:col-span-1">
            <ImpactCard />
          </div>
        </div>
      </section>
    </div>
  )
}
