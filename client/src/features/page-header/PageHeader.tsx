import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {subtitle ? (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  )
}
