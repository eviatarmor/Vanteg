import { useEffect, useState } from "react"
import { Server } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"

import { EmptyState } from "@/features/empty-state/EmptyState"

import {
  addMcpServersFromInput,
  removeMcpServer,
  useMcpServers,
  type McpServerRecord,
} from "../model/mcp-store"
import { MCP_KINDS, type McpSource } from "../model/parse-mcp"

function serverSummary(server: McpServerRecord): string {
  if (server.url) {
    return server.url
  }
  return [server.command, ...(server.args ?? [])].filter(Boolean).join(" ")
}

export function McpServers({ onAdd }: { onAdd: () => void }) {
  const items = useMcpServers()

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Server}
        title="No MCP servers yet"
        description="Choose a kind, then paste an mcp.json snippet, command, URL, or Cursor link."
        actionLabel="Add MCP server"
        onCreate={onAdd}
        className="min-h-0 flex-1"
      />
    )
  }

  return (
    <div className="grid gap-2">
      {items.map((server) => (
        <div
          key={server.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{server.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {serverSummary(server)}
            </p>
          </div>
          <Badge variant="secondary">{server.transport}</Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeMcpServer(server.id)}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}

export function AddMcpServerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [kind, setKind] = useState<McpSource>("json")
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    setName("")
    setKind("json")
    setValue("")
    setError(null)
  }, [open])

  const kindMeta = MCP_KINDS.find((item) => item.id === kind) ?? MCP_KINDS[0]

  function close() {
    onOpenChange(false)
  }

  function onKindChange(next: McpSource) {
    setKind(next)
    setValue("")
    setError(null)
  }

  function submit() {
    const result = addMcpServersFromInput(value, {
      name: name.trim() || undefined,
      kind,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    close()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          close()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add MCP server</DialogTitle>
          <DialogDescription>
            Choose a kind, then paste the matching snippet, command, URL, or
            Cursor link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="mcp-server-name">Name</Label>
            <Input
              id="mcp-server-name"
              value={name}
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
              placeholder="Leave blank to infer from the snippet"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mcp-server-kind">Kind</Label>
            <Select
              value={kind}
              onValueChange={(next) => {
                if (next) {
                  onKindChange(next as McpSource)
                }
              }}
            >
              <SelectTrigger
                id="mcp-server-kind"
                className="w-full"
                aria-label="Kind"
              >
                <SelectValue placeholder="Select kind" />
              </SelectTrigger>
              <SelectContent>
                {MCP_KINDS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mcp-server-value">{kindMeta.fieldLabel}</Label>
            {kindMeta.control === "textarea" ? (
              <Textarea
                id="mcp-server-value"
                value={value}
                onChange={(event) => {
                  setValue(event.currentTarget.value)
                  setError(null)
                }}
                placeholder={kindMeta.placeholder}
                aria-label={kindMeta.fieldLabel}
                className="min-h-36 font-mono text-xs"
              />
            ) : (
              <Input
                id="mcp-server-value"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setError(null)
                }}
                placeholder={kindMeta.placeholder}
                aria-label={kindMeta.fieldLabel}
                autoComplete="off"
              />
            )}
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={value.trim() === ""}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
