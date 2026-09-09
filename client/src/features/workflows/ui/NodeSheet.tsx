import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import { Textarea } from "@workspace/ui/components/textarea"

import { ExplorerTree } from "@/features/data/ui/ExplorerTree"

import { getNodeTypeForEditor } from "../model/auth-fields"
import { getNodePorts, portColorValue } from "../model/node-ports"
import type { VantegEdge, VantegNode, VantegNodePatch } from "../model/types"
import { NodeConfigFields } from "./NodeConfigFields"
import { NodeIcon } from "./node-icons"
import { explorerGroupIds, inExplorerNodes, outExplorerNodes } from "./node-io-tree"

const sheetTabs = [
  { id: "in", label: "In" },
  { id: "setup", label: "Setup" },
  { id: "out", label: "Out" },
] as const

function NodeIoTree({
  nodes,
  empty,
  label,
}: {
  nodes: ReturnType<typeof outExplorerNodes>
  empty: string
  label: string
}) {
  if (nodes.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <ExplorerTree
      aria-label={label}
      readOnly
      className="min-h-0 flex-1 px-2 py-2"
      nodes={nodes}
      defaultExpanded={explorerGroupIds(nodes)}
    />
  )
}

export function NodeSheet({
  node,
  nodes = [],
  edges = [],
  onClose,
  onChange,
}: {
  node: VantegNode | null
  nodes?: VantegNode[]
  edges?: VantegEdge[]
  onClose: () => void
  onChange: (nodeId: string, patch: VantegNodePatch) => void
}) {
  const catalog = node ? getNodeTypeForEditor(node.data.catalogId) : undefined
  const ports = node ? getNodePorts(node.data.catalogId) : []

  return (
    <Sheet
      key={node?.id ?? "closed"}
      open={node !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent
        side="right"
        className="gap-0 sm:max-w-4xl data-[side=right]:sm:max-w-4xl"
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
                <NodeIoTree
                  label="In"
                  nodes={inExplorerNodes(node.id, nodes, edges)}
                  empty="No variables from previous nodes. Connect an upstream step to receive its outputs."
                />
              </TabsContent>
              <TabsContent
                value="setup"
                className="min-h-0 flex-1 overflow-hidden p-0"
              >
                <ScrollFade className="h-full" viewportClassName="px-4 py-4">
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
                    <Label htmlFor="node-name">Name</Label>
                    <Input
                      id="node-name"
                      value={node.data.label}
                      placeholder="Step name"
                      onChange={(event) =>
                        onChange(node.id, { label: event.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown on the canvas. Does not change the step type.
                    </p>
                  </section>
                  {catalog ? (
                    <NodeConfigFields
                      node={node}
                      catalog={catalog}
                      onChange={onChange}
                    />
                  ) : null}
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
                </ScrollFade>
              </TabsContent>
              <TabsContent
                value="out"
                className="min-h-0 flex-1 overflow-hidden p-0"
              >
                <NodeIoTree
                  label="Out"
                  nodes={outExplorerNodes(node)}
                  empty="No outputs to send to the next node."
                />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
