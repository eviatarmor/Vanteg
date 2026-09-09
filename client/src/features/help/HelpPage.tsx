import { CircleHelp } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

export function HelpPage() {
  const { title, subtitle } = getPageCopy("/help")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={CircleHelp} />
      <EmptyState
        icon={CircleHelp}
        title="No help articles yet"
        description="Guides and answers for Vanteg will show up here."
        className="min-h-0 flex-1"
      />
    </div>
  )
}
