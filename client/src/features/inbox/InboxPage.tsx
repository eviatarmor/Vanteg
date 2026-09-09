import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { AlertCircle, Inbox } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import {
  humanizeInboxDecisionError,
  humanizeInboxLoadError,
  loadInboxItems,
  type InboxLoadStatus,
} from "./model/load"
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

const actionLabel: Record<InboxAction, string> = {
  approved: "Approve",
  denied: "Deny",
  always: "Always approve",
}

function InboxCardSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4" aria-hidden>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-3/4 max-w-md" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-28" />
      </div>
    </article>
  )
}

function InboxSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 overflow-auto px-6 py-6"
      data-testid="inbox-skeleton"
      aria-busy="true"
      aria-label="Loading inbox"
    >
      <InboxCardSkeleton />
      <InboxCardSkeleton />
      <InboxCardSkeleton />
    </div>
  )
}

function InboxCard({ item }: { item: InboxItem }) {
  const [pendingAction, setPendingAction] = useState<InboxAction | null>(null)
  const busy = pendingAction !== null

  async function decide(action: InboxAction) {
    if (busy) {
      return
    }
    setPendingAction(action)
    try {
      const next = await decideInbox(item.id, action)
      if (!next) {
        toast.error("Couldn’t apply decision")
        return
      }
      toast.success(decisionCopy[action](item))
    } catch (error: unknown) {
      toast.error(humanizeInboxDecisionError(error))
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      aria-busy={busy}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{kindLabel[item.kind]}</Badge>
          <p className="text-xs text-muted-foreground">{item.source}</p>
        </div>
        <h2 className="mt-2 text-sm font-medium">{item.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
      </div>
      <ButtonGroup aria-label={`Decide ${item.title}`}>
        {(["approved", "denied", "always"] as const).map((action) => {
          const isThisPending = pendingAction === action
          return (
            <Button
              key={action}
              type="button"
              size="sm"
              variant={action === "approved" ? "default" : "outline"}
              disabled={busy}
              aria-label={`${actionLabel[action]}: ${item.title}`}
              aria-busy={isThisPending}
              onClick={() => {
                void decide(action)
              }}
            >
              {isThisPending ? <Spinner className="size-3.5" /> : null}
              {actionLabel[action]}
            </Button>
          )
        })}
      </ButtonGroup>
    </article>
  )
}

export function InboxPage() {
  const { title, subtitle } = getPageCopy("/inbox")
  const navigate = useNavigate()
  const items = usePendingInbox()
  const [status, setStatus] = useState<InboxLoadStatus>("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback(() => {
    setStatus("loading")
    setErrorMessage(null)
    void loadInboxItems()
      .then(() => {
        setStatus("ready")
      })
      .catch((error: unknown) => {
        setStatus("error")
        setErrorMessage(humanizeInboxLoadError(error))
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Inbox} />
      {status === "loading" ? <InboxSkeleton /> : null}
      {status === "error" ? (
        <div
          role="alert"
          className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center"
        >
          <AlertCircle className="size-8 text-destructive" aria-hidden />
          <p className="mt-3 text-sm font-medium">Could not load inbox</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {errorMessage ?? humanizeInboxLoadError(null)}
          </p>
          <Button type="button" className="mt-4" variant="outline" onClick={load}>
            Try again
          </Button>
        </div>
      ) : null}
      {status === "ready" && items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox is empty"
          description="You're caught up. Approvals from agents and workflows will show up here — or browse templates to automate the next thing."
          actionLabel="Browse templates"
          onCreate={() => navigate("/templates")}
          className="min-h-0 flex-1"
        />
      ) : null}
      {status === "ready" && items.length > 0 ? (
        <div
          className="flex flex-col gap-3 overflow-auto px-6 py-6"
          role="list"
          aria-label="Pending inbox items"
        >
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <InboxCard item={item} />
            </div>
          ))}
          <p className="sr-only">
            Use Tab to move between Approve, Deny, and Always approve for each item.
          </p>
        </div>
      ) : null}
    </div>
  )
}
