import { Settings } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

export function SettingsPage() {
  const { title, subtitle } = getPageCopy("/settings")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Settings} />
      <EmptyState
        icon={Settings}
        title="No settings yet"
        description="Workspace and account preferences will show up here."
        className="min-h-0 flex-1"
      />
    </div>
  )
}
