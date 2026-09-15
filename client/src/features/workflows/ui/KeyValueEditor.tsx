import { Plus, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import type { MentionItem } from "@/components/mention/types"

import { parseKeyValue, serializeKeyValue } from "../model/structured-fields"
import type { FieldMode } from "../model/types"
import { WorkflowExpressionInput } from "./WorkflowExpressionInput"

export function KeyValueEditor({
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
  const rows = parseKeyValue(value)
  const setRows = (next: typeof rows) => onChange(serializeKeyValue(next))

  return (
    <div id={id} className="grid gap-2" role="group" aria-label={label}>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No entries yet.</p>
      ) : null}
      {rows.map((row, index) => (
        <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
          <div className="grid gap-1">
            {index === 0 ? <Label className="text-xs">Key</Label> : null}
            <Input
              value={row.key}
              placeholder="Key"
              aria-label={`${label} key ${index + 1}`}
              onChange={(event) =>
                setRows(rows.map((item) => (item.id === row.id ? { ...item, key: event.target.value } : item)))
              }
            />
          </div>
          <div className="grid gap-1">
            {index === 0 ? <Label className="text-xs">Value</Label> : null}
            <WorkflowExpressionInput
              value={row.value}
              items={items}
              availablePaths={availablePaths}
              mode={mode}
              placeholder="Value"
              aria-label={`${label} value ${index + 1}`}
              onChange={(next) =>
                setRows(rows.map((item) => (item.id === row.id ? { ...item, value: next } : item)))
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={index === 0 ? "mt-5" : ""}
            aria-label={`Remove ${label} row ${index + 1}`}
            onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setRows([...rows, { id: crypto.randomUUID(), key: "", value: "" }])
        }
      >
        <Plus className="size-3.5" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  )
}
