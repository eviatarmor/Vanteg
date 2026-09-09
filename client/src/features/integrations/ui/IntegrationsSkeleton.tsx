import { Skeleton } from "@workspace/ui/components/skeleton"

function ConnectorCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
      aria-hidden
    >
      <Skeleton className="size-8 shrink-0 rounded-lg" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

export function IntegrationsSkeleton() {
  return (
    <div
      className="grid gap-2"
      data-testid="integrations-skeleton"
      aria-busy="true"
      aria-label="Loading connectors"
    >
      <ConnectorCardSkeleton />
      <ConnectorCardSkeleton />
      <ConnectorCardSkeleton />
    </div>
  )
}
