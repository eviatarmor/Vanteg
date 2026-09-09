import { Bot, Users, Workflow } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type { SubTemplate, TemplateType } from "../model/types"

const typeMeta: Record<
  TemplateType,
  { label: string; icon: typeof Bot; className: string }
> = {
  assistant: {
    label: "Assistant",
    icon: Bot,
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  workflow: {
    label: "Workflow",
    icon: Workflow,
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  team: {
    label: "Team",
    icon: Users,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
}

export function TemplateTypeBadge({ type }: { type: TemplateType }) {
  const meta = typeMeta[type]
  const Icon = meta.icon
  return (
    <Badge variant="secondary" className={cn("gap-1", meta.className)}>
      <Icon aria-hidden />
      {meta.label}
    </Badge>
  )
}

export function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: SubTemplate
  selected: boolean
  onSelect: (template: SubTemplate) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={template.title}
      onClick={() => onSelect(template)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect(template)
        }
      }}
      className={cn(
        "flex h-full flex-col rounded-xl border bg-card px-4 py-3.5 text-left transition-colors outline-none",
        "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary ring-1 ring-primary/40"
          : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <TemplateTypeBadge type={template.type} />
      </div>
      <p className="mt-2.5 text-sm font-medium text-foreground">{template.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {template.description}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {template.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-[11px] font-normal">
            {tag}
          </Badge>
        ))}
      </div>
    </button>
  )
}
