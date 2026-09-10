import { Plus, type LucideIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onCreate,
  secondaryActionLabel,
  onSecondary,
  align = "center",
  framed = true,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onCreate?: () => void
  secondaryActionLabel?: string
  onSecondary?: () => void
  align?: "center" | "start"
  framed?: boolean
  className?: string
}) {
  const hasPrimary = Boolean(actionLabel && onCreate)
  const hasSecondary = Boolean(secondaryActionLabel && onSecondary)
  const startAligned = align === "start"

  return (
    <div
      className={cn(
        "flex justify-center",
        startAligned
          ? "min-h-0 items-start p-3"
          : "min-h-0 flex-1 items-center",
        className
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-md flex-col items-center text-center",
          framed &&
            "rounded-xl border border-dashed border-border bg-card shadow-sm",
          startAligned ? "px-5 py-6" : "px-8 py-12"
        )}
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {hasPrimary || hasSecondary ? (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-2",
              startAligned ? "mt-4" : "mt-6"
            )}
          >
            {hasPrimary ? (
              <Button onClick={onCreate}>
                <Plus />
                {actionLabel}
              </Button>
            ) : null}
            {hasSecondary ? (
              <Button type="button" variant="outline" onClick={onSecondary}>
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
