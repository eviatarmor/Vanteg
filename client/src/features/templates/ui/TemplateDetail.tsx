import { Check, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"

import { getIndustry } from "../model/catalog"
import type { SubTemplate } from "../model/types"
import { useTemplate } from "../model/use-template"
import { TemplateTypeBadge } from "./TemplateCard"

export function TemplateDetail({
  template,
  onNavigate,
  className,
}: {
  template: SubTemplate | null
  onNavigate: (path: string) => void
  className?: string
}) {
  if (!template) {
    return (
      <div
        data-testid="template-detail"
        className={cn(
          "flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center",
          className
        )}
      >
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
          <LayoutTemplate className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-sm font-medium">Select a template</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Preview what is included, then create a draft assistant, workflow, or
          team.
        </p>
      </div>
    )
  }

  const industry = getIndustry(template.industryId)

  function handleUse() {
    const result = useTemplate(template!)
    if (result.kind === "team") {
      toast.success(`Created team "${template!.title}"`)
    } else if (result.kind === "assistant") {
      toast.success(`Created assistant "${template!.title}"`)
    } else {
      toast.success(`Created workflow "${template!.title}"`)
    }
    onNavigate(result.path)
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      data-testid="template-detail"
    >
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <TemplateTypeBadge type={template.type} />
          {industry ? (
            <span className="text-xs text-muted-foreground">{industry.name}</span>
          ) : null}
        </div>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          {template.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-5 py-4">
        <p className="text-sm leading-relaxed text-foreground/90">
          {template.longDescription}
        </p>
        <h3 className="mt-5 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
          What&apos;s included
        </h3>
        <ul className="mt-2 space-y-2">
          {template.includes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <Check
                className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="border-t border-border px-5 py-4">
        <Button className="w-full" onClick={handleUse}>
          Use template
        </Button>
      </div>
    </div>
  )
}
