import { Skeleton } from "@workspace/ui/components/skeleton"

function WorkflowCardSkeleton() {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
      aria-hidden
    >
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

export function WorkflowsSkeleton() {
  return (
    <div
      className="grid gap-3"
      data-testid="workflows-skeleton"
      aria-busy="true"
      aria-label="Loading workflows"
    >
      <Skeleton className="h-9 w-full max-w-sm" />
      <WorkflowCardSkeleton />
      <WorkflowCardSkeleton />
      <WorkflowCardSkeleton />
    </div>
  )
}
