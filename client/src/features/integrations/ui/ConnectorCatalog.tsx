import { useMemo, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"

import { authKindLabel } from "../model/auth-kind"
import { CONNECTORS } from "../model/catalog"
import { useIntegrationsStore } from "../model/store"
import type { Connector } from "../model/types"
import { BrandIconCard } from "./BrandIcon"

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
    <div className="@container flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 pb-3">
        <Input
          id="connector-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search connectors"
          aria-label="Search connectors"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pt-3">
        <div
          data-slot="connector-catalog-grid"
          className="grid grid-cols-1 gap-2 pr-1 @min-[28rem]:grid-cols-2 @min-[42rem]:grid-cols-3 @min-[56rem]:grid-cols-4"
        >
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
                <div className="flex items-start gap-2.5">
                  <BrandIconCard slug={connector.iconSlug} name={connector.name} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="min-w-0 flex-1 truncate">{connector.name}</span>
                      {connected ? <Badge variant="secondary">Connected</Badge> : null}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {connector.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="mt-2.5 uppercase">
                  {authKindLabel(connector.auth.kind)}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
