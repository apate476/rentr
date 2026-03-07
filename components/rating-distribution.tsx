type ReviewRow = { score_overall: number }

function barClass(star: number): string {
  if (star >= 4) return 'bg-green-400'
  if (star === 3) return 'bg-amber-400'
  return 'bg-red-400'
}

export function RatingDistribution({ reviews }: { reviews: ReviewRow[] }) {
  const total = reviews.length
  if (total === 0) return null

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.score_overall) === star).length,
  }))

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        Rating breakdown
      </p>
      <div className="space-y-2">
        {counts.map(({ star, count }) => {
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-right text-xs font-medium text-slate-500">
                {star}★
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barClass(star)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right text-xs text-slate-400">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
