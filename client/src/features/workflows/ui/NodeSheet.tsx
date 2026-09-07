import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Editable,
  EditableArea,
  EditableInput,
  EditableLabel,
  EditablePreview,
} from "@workspace/ui/components/editable"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"

import { getNodeType } from "../model/node-catalog"
import { getNodePorts, portColorValue } from "../model/node-ports"
import type { FreezeNode, FreezeNodePatch, NodeVar } from "../model/types"
import { CodeField } from "./CodeField"
import { NodeIcon } from "./node-icons"

const sheetTabs = [
  { id: "in", label: "In" },
  { id: "setup", label: "Setup" },
  { id: "out", label: "Out" },
] as const

function NodeVarsGrid({
  vars,
  onChange,
}: {
  vars: NodeVar[]
  onChange: (vars: NodeVar[]) => void
}) {
  function patch(id: string, field: "key" | "value", value: string) {
    onChange(
      vars.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="px-2 py-2 text-left font-medium">Key</th>
            <th className="px-2 py-2 text-left font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {vars.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-1">
                <Input
                  value={item.key}
                  aria-label="Key"
                  onChange={(event) => patch(item.id, "key", event.target.value)}
                />
              </td>
              <td className="p-1">
                <Input
                  value={item.value}
                  aria-label="Value"
                  onChange={(event) =>
                    patch(item.id, "value", event.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 self-start"
        onClick={() =>
          onChange([...vars, { id: crypto.randomUUID(), key: "", value: "" }])
        }
      >
        Add variable
      </Button>
    </div>
  )
}

export function NodeSheet({
  node,
  onClose,
  onChange,
}: {
  node: FreezeNode | null
  onClose: () => void
  onChange: (nodeId: string, patch: FreezeNodePatch) => void
}) {
  const catalog = node ? getNodeType(node.data.catalogId) : undefined
  const ports = node ? getNodePorts(node.data.catalogId) : []

  return (
    <Sheet
      key={node?.id ?? "closed"}
      open={node !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent
        side="right"
        className="gap-0 sm:max-w-xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {node ? (
          <>
            <SheetHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <NodeIcon catalogId={node.data.catalogId} className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle>{catalog?.label ?? node.data.label}</SheetTitle>
                    <Badge variant="outline" className="capitalize">
                      {catalog?.kind ?? "node"}
                    </Badge>
                  </div>
                  <SheetDescription>
                    {catalog?.description ?? "Configure this step."}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <Tabs
              defaultValue="setup"
              className="min-h-0 flex-1 gap-0 overflow-hidden"
            >
              <div className="flex h-10 shrink-0 items-stretch border-b px-4">
                <TabsList variant="line" className="h-10 w-full justify-start gap-6">
                  {sheetTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="h-full flex-none px-1"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <TabsContent
                value="in"
                className="min-h-0 flex-1 overflow-hidden p-0"
              >
                <NodeVarsGrid
                  vars={node.data.inVars}
                  onChange={(inVars) => onChange(node.id, { inVars })}
                />
              </TabsContent>
              <TabsContent
                value="setup"
                className="flex-1 overflow-auto px-4 py-4"
              >
                <div className="flex flex-col gap-5">
                  <section className="grid gap-2">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Ports
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ports.map((port) => (
                        <span
                          key={`${port.type}-${port.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs"
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ background: portColorValue[port.color] }}
                          />
                          <span className="text-muted-foreground capitalize">
                            {port.type}
                          </span>
                          {port.label}
                        </span>
                      ))}
                    </div>
                  </section>
                  <section className="grid gap-2">
                    <Editable
                      value={node.data.label}
                      onValueChange={(label) => onChange(node.id, { label })}
                      placeholder="Step name"
                      className="gap-1.5"
                    >
                      <EditableLabel>Name</EditableLabel>
                      <EditableArea className="w-full">
                        <EditablePreview className="min-h-8 w-full rounded-lg border border-transparent px-2.5 py-1.5 hover:border-border" />
                        <EditableInput className="h-8 shadow-none" />
                      </EditableArea>
                    </Editable>
                    <p className="text-xs text-muted-foreground">
                      Shown on the canvas. Does not change the step type.
                    </p>
                  </section>
                  {(catalog?.fields.length ?? 0) > 0 ? (
                    <section className="grid gap-4">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Configuration
                      </p>
                      {catalog?.fields.map((field) => (
                        <div key={field.key} className="grid gap-2">
                          <Label htmlFor={`node-${field.key}`}>{field.label}</Label>
                          {field.control === "code" ? (
                            <CodeField
                              id={`node-${field.key}`}
                              value={node.data.config[field.key] ?? ""}
                              language={field.language ?? "javascript"}
                              onChange={(value) =>
                                onChange(node.id, {
                                  config: {
                                    ...node.data.config,
                                    [field.key]: value,
                                  },
                                })
                              }
                            />
                          ) : field.control === "textarea" ? (
                            <Textarea
                              id={`node-${field.key}`}
                              value={node.data.config[field.key] ?? ""}
                              placeholder={field.placeholder}
                              onChange={(event) =>
                                onChange(node.id, {
                                  config: {
                                    ...node.data.config,
                                    [field.key]: event.target.value,
                                  },
                                })
                              }
                            />
                          ) : field.control === "select" && field.options ? (
                            <Select
                              value={
                                node.data.config[field.key] ||
                                field.options[0]?.value
                              }
                              onValueChange={(value) => {
                                if (!value) {
                                  return
                                }
                                onChange(node.id, {
                                  config: {
                                    ...node.data.config,
                                    [field.key]: value,
                                  },
                                })
                              }}
                            >
                              <SelectTrigger
                                id={`node-${field.key}`}
                                className="w-full"
                                aria-label={field.label}
                              >
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`node-${field.key}`}
                              value={node.data.config[field.key] ?? ""}
                              placeholder={field.placeholder}
                              onChange={(event) =>
                                onChange(node.id, {
                                  config: {
                                    ...node.data.config,
                                    [field.key]: event.target.value,
                                  },
                                })
                              }
                            />
                          )}
                          {field.help ? (
                            <p className="text-xs text-muted-foreground">
                              {field.help}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </section>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This step has no extra settings. Rename it or add notes below.
                    </p>
                  )}
                  <section className="grid gap-2">
                    <Label htmlFor="node-notes">Notes</Label>
                    <Textarea
                      id="node-notes"
                      value={node.data.notes}
                      placeholder="Why this step exists, edge cases, owners…"
                      onChange={(event) =>
                        onChange(node.id, { notes: event.target.value })
                      }
                    />
                  </section>
                </div>
              </TabsContent>
              <TabsContent
                value="out"
                className="min-h-0 flex-1 overflow-hidden p-0"
              >
                <NodeVarsGrid
                  vars={node.data.outVars}
                  onChange={(outVars) => onChange(node.id, { outVars })}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
