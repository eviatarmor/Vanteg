import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function ExplorerSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex w-56 shrink-0 flex-col gap-2 border-r border-border p-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6" />
      </div>
    </div>
  )
}

export function ResourceError({
  title,
  message,
  onRetry,
  retryLabel = "Retry",
}: {
  title: string
  message: string
  onRetry: () => void
  retryLabel?: string
}) {
  return (
    <div className="flex min-h-[20rem] flex-1 items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-xl">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>{message}</span>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
