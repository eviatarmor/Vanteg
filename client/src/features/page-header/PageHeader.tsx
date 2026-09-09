import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export function PageHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div className={cn("border-b border-border px-6 pt-6 pb-4", className)}>
      <div className="flex items-center justify-between gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight text-foreground">
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
