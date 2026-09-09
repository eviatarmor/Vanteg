import { Workflow } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"

export function EmptyWorkflows({
  title,
  description,
  actionLabel,
  onCreate,
  onBrowseTemplates,
}: {
  title: string
  description: string
  actionLabel?: string
  onCreate?: () => void
  onBrowseTemplates?: () => void
}) {
  return (
    <EmptyState
      icon={Workflow}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onCreate={onCreate}
      secondaryActionLabel={onBrowseTemplates ? "Browse templates" : undefined}
      onSecondary={onBrowseTemplates}
    />
  )
}
