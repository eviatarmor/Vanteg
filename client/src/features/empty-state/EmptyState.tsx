import { Plus, type LucideIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onCreate,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onCreate?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex min-h-[28rem] items-center justify-center", className)}>
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center shadow-sm">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {actionLabel && onCreate ? (
          <Button className="mt-6" onClick={onCreate}>
            <Plus />
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
