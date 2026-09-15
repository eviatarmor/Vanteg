import { Plus, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import type { MentionItem } from "@/components/mention/types"

import { parseMapping, serializeMapping, type MappingRow } from "../model/structured-fields"
import type { FieldMode } from "../model/types"
import { WorkflowExpressionInput } from "./WorkflowExpressionInput"

const OPS: { value: MappingRow["op"]; label: string }[] = [
  { value: "set", label: "Set / add" },
  { value: "replace", label: "Replace" },
  { value: "rename", label: "Rename" },
  { value: "remove", label: "Remove" },
  { value: "pick", label: "Pick" },
  { value: "omit", label: "Omit" },
]

const TYPES: { value: MappingRow["type"]; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "json", label: "JSON" },
]

export function MappingEditor({
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
  const rows = parseMapping(value)
  const setRows = (next: MappingRow[]) => onChange(serializeMapping(next))

  return (
    <div id={id} className="grid gap-3" role="group" aria-label={label}>
      {rows.map((row, index) => {
        const needsValue = row.op === "set" || row.op === "replace" || row.op === "rename"
        return (
          <div key={row.id} className="grid gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <Select
                value={row.op}
                onValueChange={(op) =>
                  op &&
                  setRows(rows.map((item) => (item.id === row.id ? { ...item, op: op as MappingRow["op"] } : item)))
                }
              >
                <SelectTrigger aria-label={`${label} operation ${index + 1}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove mapping ${index + 1}`}
                onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Path</Label>
              <Input
                value={row.path}
                placeholder="user.email"
                aria-label={`${label} path ${index + 1}`}
                onChange={(event) =>
                  setRows(rows.map((item) => (item.id === row.id ? { ...item, path: event.target.value } : item)))
                }
              />
            </div>
            {needsValue ? (
              <div className="grid gap-1">
                <Label className="text-xs">{row.op === "rename" ? "New name" : "Value"}</Label>
                <WorkflowExpressionInput
                  value={row.value}
                  items={items}
                  availablePaths={availablePaths}
                  mode={mode}
                  placeholder={row.op === "rename" ? "emailAddress" : "{{Webhook.body.email}}"}
                  aria-label={`${label} value ${index + 1}`}
                  onChange={(next) =>
                    setRows(rows.map((item) => (item.id === row.id ? { ...item, value: next } : item)))
                  }
                />
              </div>
            ) : null}
            {row.op === "set" || row.op === "replace" ? (
              <Select
                value={row.type}
                onValueChange={(type) =>
                  type &&
                  setRows(
                    rows.map((item) =>
                      item.id === row.id ? { ...item, type: type as MappingRow["type"] } : item
                    )
                  )
                }
              >
                <SelectTrigger aria-label={`${label} type ${index + 1}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setRows([
            ...rows,
            { id: crypto.randomUUID(), op: "set", path: "", value: "", type: "auto" },
          ])
        }
      >
        <Plus className="size-3.5" />
        Add mapping
      </Button>
    </div>
  )
}
