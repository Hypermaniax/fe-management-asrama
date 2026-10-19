import { Skeleton } from '@/components/ui/skeleton'

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-20 border-transparent bg-foreground/10" />
        <Skeleton className="size-9 border-transparent bg-foreground/10" />
      </div>
      <Skeleton className="h-7 w-28 border-transparent bg-foreground/10" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-5 shadow-shadow">
          <Skeleton className="h-3 w-24 border-transparent bg-foreground/10" />
          <Skeleton className="h-6 w-56 border-transparent bg-foreground/10" />
          <Skeleton className="h-64 w-full border-transparent bg-foreground/10" />
        </div>
        <div className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-5 shadow-shadow">
          <Skeleton className="h-3 w-20 border-transparent bg-foreground/10" />
          <Skeleton className="h-6 w-40 border-transparent bg-foreground/10" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-12 w-full border-transparent bg-foreground/10"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
