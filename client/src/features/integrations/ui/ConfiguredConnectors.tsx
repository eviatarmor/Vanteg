import { useState } from "react"
import { Plug } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/features/empty-state/EmptyState"

import { getConnector } from "../model/catalog"
import { disconnectConnector, useIntegrationsStore } from "../model/store"
import { BrandIcon } from "./BrandIcon"

export function ConfiguredConnectors({ onAdd }: { onAdd: () => void }) {
  const snapshot = useIntegrationsStore()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDisconnect(connectionId: string) {
    setPendingId(connectionId)
    setError(null)
    const result = await disconnectConnector(connectionId)
    setPendingId(null)
    if (!result.ok) {
      setError(result.error.message)
    }
  }

  if (snapshot.connections.length === 0) {
    return (
      <EmptyState
        icon={Plug}
        title="No connectors configured"
        description="Connect an app to use it from workflow steps."
        actionLabel="Add connector"
        onCreate={onAdd}
        className="min-h-0 flex-1"
      />
    )
  }

  return (
    <div className="grid gap-2">
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {snapshot.connections.map((connection) => {
        const connector = getConnector(connection.connectorId)
        if (!connector) {
          return null
        }
        return (
          <div
            key={connection.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
          >
            <BrandIcon slug={connector.iconSlug} name={connector.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{connector.name}</p>
              <p className="text-xs text-muted-foreground">
                {connector.category} · {connector.auth.kind}
              </p>
            </div>
            <Badge variant="secondary">Connected</Badge>
            <Button
              size="sm"
              variant="ghost"
              disabled={pendingId === connection.id}
              onClick={() => void handleDisconnect(connection.id)}
            >
              {pendingId === connection.id ? "Disconnecting…" : "Disconnect"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
