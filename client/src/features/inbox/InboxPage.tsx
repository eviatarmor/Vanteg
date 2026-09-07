import { Inbox } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import { inboxItems } from "./model/items"

export function InboxPage() {
  const { title, subtitle } = getPageCopy("/inbox")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} />
      {inboxItems.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox is empty"
          description="Items that need a look will show up here."
          className="min-h-0 flex-1"
        />
      ) : (
        <div className="flex flex-col gap-2 px-6 pb-6">
          {inboxItems.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
