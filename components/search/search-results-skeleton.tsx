import { Skeleton } from '@/components/ui/skeleton'

export function SearchResultsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-warm-border bg-warm-card p-5 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="ml-4 shrink-0 flex flex-col items-end gap-1">
            <Skeleton className="h-8 w-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
