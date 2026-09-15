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
import { Switch } from "@workspace/ui/components/switch"

import {
  parseSchemaBuilder,
  serializeSchemaBuilder,
  type SchemaRow,
} from "../model/structured-fields"

const TYPES: SchemaRow["type"][] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "datetime",
]

export function SchemaBuilder({
  id,
  label,
  value,
  onChange,
}: {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const rows = parseSchemaBuilder(value)
  const setRows = (next: SchemaRow[]) => onChange(serializeSchemaBuilder(next))

  return (
    <div id={id} className="grid gap-3" role="group" aria-label={label}>
      {rows.map((row, index) => (
        <div key={row.id} className="grid gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <Input
              value={row.key}
              placeholder="field"
              aria-label={`${label} key ${index + 1}`}
              onChange={(event) =>
                setRows(rows.map((item) => (item.id === row.id ? { ...item, key: event.target.value } : item)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove schema field ${index + 1}`}
              onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <Select
            value={row.type}
            onValueChange={(type) =>
              type &&
              setRows(
                rows.map((item) =>
                  item.id === row.id ? { ...item, type: type as SchemaRow["type"] } : item
                )
              )
            }
          >
            <SelectTrigger aria-label={`${label} type ${index + 1}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={row.description}
            placeholder="Description"
            aria-label={`${label} description ${index + 1}`}
            onChange={(event) =>
              setRows(
                rows.map((item) =>
                  item.id === row.id ? { ...item, description: event.target.value } : item
                )
              )
            }
          />
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`${row.id}-required`}>Required</Label>
            <Switch
              id={`${row.id}-required`}
              checked={row.required}
              onCheckedChange={(checked) =>
                setRows(rows.map((item) => (item.id === row.id ? { ...item, required: checked } : item)))
              }
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setRows([
            ...rows,
            { id: crypto.randomUUID(), key: "", type: "string", description: "", required: false },
          ])
        }
      >
        <Plus className="size-3.5" />
        Add field
      </Button>
    </div>
  )
}
