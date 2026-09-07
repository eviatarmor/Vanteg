import { useMemo, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"

import { CONNECTORS } from "../model/catalog"
import { useIntegrationsStore } from "../model/store"
import type { Connector } from "../model/types"
import { BrandIcon } from "./BrandIcon"

export function ConnectorCatalog({
  onPick,
}: {
  onPick: (connector: Connector) => void
}) {
  const snapshot = useIntegrationsStore()
  const [query, setQuery] = useState("")
  const connectedIds = new Set(snapshot.connections.map((item) => item.connectorId))

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return CONNECTORS
    }
    return CONNECTORS.filter(
      (connector) =>
        connector.name.toLowerCase().includes(needle) ||
        connector.description.toLowerCase().includes(needle) ||
        connector.category.toLowerCase().includes(needle)
    )
  }, [query])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <Input
        id="connector-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search connectors"
        aria-label="Search connectors"
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-2 pr-1 sm:grid-cols-2">
          {visible.map((connector) => {
            const connected = connectedIds.has(connector.id)
            return (
              <button
                key={connector.id}
                type="button"
                aria-label={connector.name}
                className="rounded-xl border border-border bg-card px-3 py-3 text-left hover:bg-muted/60"
                onClick={() => onPick(connector)}
              >
                <p className="flex items-center gap-2 text-sm font-medium">
                  <BrandIcon slug={connector.iconSlug} name={connector.name} />
                  <span className="min-w-0 flex-1 truncate">{connector.name}</span>
                  {connected ? <Badge variant="secondary">Connected</Badge> : null}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {connector.description}
                </p>
                <p className="mt-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {connector.category} · {connector.auth.kind}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
