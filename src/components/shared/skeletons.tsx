import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-base border-2 border-border bg-background">
      <div className="flex gap-4 border-b-2 border-border p-3">
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1 border-transparent bg-foreground/10" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex gap-4 border-b-2 border-border p-3 last:border-b-0"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className="h-4 flex-1 border-transparent bg-foreground/10"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-6"
        >
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-5 rounded-base border-2 border-border bg-background p-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex flex-col gap-3 rounded-base border-2 border-border bg-background p-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
