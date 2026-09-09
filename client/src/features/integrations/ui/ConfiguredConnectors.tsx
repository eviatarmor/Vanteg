import { useMemo, useState } from "react"
import { Plug, Search } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { EmptyState } from "@/features/empty-state/EmptyState"

import { getConnector } from "../model/catalog"
import { disconnectConnector, useIntegrationsStore } from "../model/store"
import { BrandIcon } from "./BrandIcon"

export function ConfiguredConnectors({ onAdd }: { onAdd: () => void }) {
  const snapshot = useIntegrationsStore()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  async function handleDisconnect(connectionId: string) {
    setPendingId(connectionId)
    setError(null)
    const result = await disconnectConnector(connectionId)
    setPendingId(null)
    if (!result.ok) {
      setError(result.error.message)
    }
  }

  const rows = useMemo(() => {
    return snapshot.connections.flatMap((connection) => {
      const connector = getConnector(connection.connectorId)
      if (!connector) {
        return []
      }
      return [{ connection, connector }]
    })
  }, [snapshot.connections])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return rows
    }
    return rows.filter(
      ({ connector }) =>
        connector.name.toLowerCase().includes(needle) ||
        connector.category.toLowerCase().includes(needle) ||
        connector.auth.kind.toLowerCase().includes(needle)
    )
  }, [query, rows])

  if (rows.length === 0) {
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
    <div className="grid gap-3">
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search connected apps"
          aria-label="Search connected apps"
          className="pl-9"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No connected apps match “{query.trim()}”.
        </p>
      ) : (
        <div className="grid gap-2">
          {filtered.map(({ connection, connector }) => (
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
          ))}
        </div>
      )}
    </div>
  )
}
