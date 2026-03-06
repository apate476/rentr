type ReviewRow = { score_overall: number }

export function RatingDistribution({ reviews }: { reviews: ReviewRow[] }) {
  const total = reviews.length
  if (total === 0) return null

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.score_overall === star).length,
  }))

  return (
    <div className="bg-card rounded-2xl border p-4">
      <p className="mb-3 text-sm font-semibold">Rating breakdown</p>
      <div className="space-y-1.5">
        {counts.map(({ star, count }) => {
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 shrink-0 text-right font-medium">{star}</span>
              <span className="text-muted-foreground">★</span>
              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-muted-foreground w-5 shrink-0 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
