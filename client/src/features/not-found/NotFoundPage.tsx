import { FileQuestion } from "lucide-react"
import { useNavigate } from "react-router"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

export function NotFoundPage() {
  const { title, subtitle } = getPageCopy("/missing")
  const navigate = useNavigate()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={FileQuestion} />
      <EmptyState
        icon={FileQuestion}
        title="This page does not exist"
        description="Check the address or go back to Home."
        actionLabel="Go home"
        onCreate={() => navigate("/")}
        className="min-h-0 flex-1"
      />
    </div>
  )
}
