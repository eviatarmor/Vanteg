import { Inbox } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { Badge } from "@workspace/ui/components/badge"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import { decideInbox, usePendingInbox } from "./model/store"
import type { InboxAction, InboxItem, InboxKind } from "./model/types"

const kindLabel: Record<InboxKind, string> = {
  agent: "Agent",
  workflow: "Workflow",
  credential: "Credential",
}

const decisionCopy: Record<InboxAction, (item: InboxItem) => string> = {
  approved: (item) => `Approved · ${item.title}`,
  denied: (item) => `Denied · ${item.title}`,
  always: (item) => `Always approved · ${item.source}`,
}

function InboxCard({ item }: { item: InboxItem }) {
  function decide(action: InboxAction) {
    const next = decideInbox(item.id, action)
    if (!next) {
      return
    }
    toast.success(decisionCopy[action](item))
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{kindLabel[item.kind]}</Badge>
          <p className="text-xs text-muted-foreground">{item.source}</p>
        </div>
        <h2 className="mt-2 text-sm font-medium">{item.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
      </div>
      <ButtonGroup aria-label={`Decide ${item.title}`}>
        <Button type="button" size="sm" onClick={() => decide("approved")}>
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => decide("denied")}
        >
          Deny
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => decide("always")}
        >
          Always approve
        </Button>
      </ButtonGroup>
    </article>
  )
}

export function InboxPage() {
  const { title, subtitle } = getPageCopy("/inbox")
  const items = usePendingInbox()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Inbox} />
      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox is empty"
          description="Approvals from agents and workflows will show up here."
          className="min-h-0 flex-1"
        />
      ) : (
        <div className="flex flex-col gap-3 overflow-auto px-6 py-6">
          {items.map((item) => (
            <InboxCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
