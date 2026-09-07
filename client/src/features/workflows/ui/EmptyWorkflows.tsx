import { Workflow } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"

export function EmptyWorkflows({
  title,
  description,
  actionLabel,
  onCreate,
}: {
  title: string
  description: string
  actionLabel?: string
  onCreate?: () => void
}) {
  return (
    <EmptyState
      icon={Workflow}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onCreate={onCreate}
    />
  )
}
