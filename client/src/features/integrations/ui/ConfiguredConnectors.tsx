import { Plug } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/features/empty-state/EmptyState"

import { getConnector } from "../model/catalog"
import { disconnectConnector, useIntegrationsStore } from "../model/store"
import { BrandIcon } from "./BrandIcon"

export function ConfiguredConnectors({ onAdd }: { onAdd: () => void }) {
  const snapshot = useIntegrationsStore()

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
              onClick={() => disconnectConnector(connection.id)}
            >
              Disconnect
            </Button>
          </div>
        )
      })}
    </div>
  )
}
