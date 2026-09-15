import { Plus, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import type { MentionItem } from "@/components/mention/types"

import { parseRoutes, serializeRoutes, uniqueRouteNames } from "../model/structured-fields"
import type { FieldMode } from "../model/types"
import { WorkflowExpressionInput } from "./WorkflowExpressionInput"

export function RouteEditor({
  id,
  label,
  value,
  items,
  availablePaths,
  mode = "either",
  onChange,
}: {
  id?: string
  label: string
  value: string
  items: MentionItem[]
  availablePaths: Iterable<string>
  mode?: FieldMode
  onChange: (value: string) => void
}) {
  const rows = parseRoutes(value)
  const setRows = (next: typeof rows) => onChange(serializeRoutes(next))
  const unique = uniqueRouteNames(rows)

  return (
    <div id={id} className="grid gap-3" role="group" aria-label={label}>
      {rows.map((row, index) => (
        <div key={row.id} className="grid gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">ID {row.id}</p>
            {rows.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove ${label} ${index + 1}`}
                onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            ) : null}
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Name</Label>
            <Input
              value={row.name}
              placeholder={`Route ${index + 1}`}
              aria-label={`${label} name ${index + 1}`}
              onChange={(event) =>
                setRows(rows.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)))
              }
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Value</Label>
            <WorkflowExpressionInput
              value={row.value}
              items={items}
              availablePaths={availablePaths}
              mode={mode}
              placeholder="open"
              aria-label={`${label} value ${index + 1}`}
              onChange={(next) =>
                setRows(rows.map((item) => (item.id === row.id ? { ...item, value: next } : item)))
              }
            />
          </div>
        </div>
      ))}
      {!unique ? (
        <p className="text-xs text-destructive" role="status">
          Route names must be unique.
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setRows([
            ...rows,
            { id: `route_${crypto.randomUUID().slice(0, 8)}`, name: `Route ${rows.length + 1}`, value: "" },
          ])
        }
      >
        <Plus className="size-3.5" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  )
}
