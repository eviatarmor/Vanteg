import { Home } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

export function HomePage() {
  const { title, subtitle } = getPageCopy("/")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} />
      <EmptyState
        icon={Home}
        title="Nothing on the dashboard yet"
        description="Runs, mentions, and pinned work will show up here."
        className="min-h-0 flex-1"
      />
    </div>
  )
}
