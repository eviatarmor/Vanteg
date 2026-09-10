import { SquareDashed } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

import { EmptyState } from "@/features/empty-state/EmptyState"
import type { PageTab } from "@/features/page-tabs/types"

import { retryApiKeysLoad, useApiKeysStore } from "../model/store"
import type { ApiKey, ApiKeyKind } from "../model/types"
import { ApiKeysList } from "./ApiKeysList"

export function ApiKeysPanel({
  tab,
  onCreate,
  onRevoke,
}: {
  tab: PageTab
  onCreate: () => void
  onRevoke: (key: ApiKey) => void
}) {
  const snapshot = useApiKeysStore()
  const kind = tab.id as ApiKeyKind
  const keys = snapshot.keys.filter((item) => item.kind === kind)

  if (snapshot.loadState === "loading") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Spinner className="size-6" />
        Loading API keys…
      </div>
    )
  }

  if (snapshot.loadState === "error") {
    return (
      <Alert variant="destructive" className="max-w-xl">
        <AlertTitle>Could not load API keys</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>{snapshot.loadError ?? "Stored key data looks corrupt."}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => retryApiKeysLoad()}>
            Clear storage and retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (keys.length === 0) {
    return (
      <EmptyState
        icon={SquareDashed}
        title={tab.emptyTitle ?? `No ${tab.label.toLowerCase()} yet`}
        description={tab.description}
        actionLabel={tab.newAction.label}
        onCreate={onCreate}
      />
    )
  }

  return <ApiKeysList keys={keys} onRevoke={onRevoke} />
}
