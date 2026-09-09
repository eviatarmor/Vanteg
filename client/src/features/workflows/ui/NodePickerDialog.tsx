import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { BrandIcon } from "@/features/integrations/ui/BrandIcon"

import {
  listConnectorApps,
  listPickerSections,
  type ConnectorApp,
} from "../model/node-catalog"
import type { WorkflowNodeType } from "../model/types"
import { NodeIcon } from "./node-icons"

const methodFilters = [
  { id: "all", label: "All" },
  { id: "trigger", label: "Triggers" },
  { id: "action", label: "Actions" },
] as const

function NodeCard({
  node,
  onChoose,
}: {
  node: WorkflowNodeType
  onChoose: (node: WorkflowNodeType) => void
}) {
  return (
    <button
      type="button"
      className="rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/60"
      onClick={() => onChoose(node)}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <NodeIcon catalogId={node.id} className="size-4" />
        {node.label}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {node.description}
      </p>
    </button>
  )
}

export function NodePickerDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (nodeType: WorkflowNodeType) => void
}) {
  const sections = listPickerSections()
  const apps = listConnectorApps()
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [methodFilter, setMethodFilter] = useState<(typeof methodFilters)[number]["id"]>(
    "all"
  )
  const selectedApp = apps.find((app) => app.id === selectedAppId) ?? null

  useEffect(() => {
    if (!open) {
      setSelectedAppId(null)
      setMethodFilter("all")
    }
  }, [open])

  function choose(node: WorkflowNodeType) {
    onAdd(node)
    onOpenChange(false)
  }

  function openApp(app: ConnectorApp) {
    setMethodFilter("all")
    setSelectedAppId(app.id)
  }

  const methods =
    selectedApp?.methods.filter((method) =>
      methodFilter === "all" ? true : method.kind === methodFilter
    ) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          {selectedApp ? (
            <div className="flex items-start gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mt-0.5"
                aria-label="Back to connectors"
                onClick={() => setSelectedAppId(null)}
              >
                <ChevronLeft />
              </Button>
              <div className="min-w-0">
                <DialogTitle>{selectedApp.name}</DialogTitle>
                <DialogDescription>{selectedApp.description}</DialogDescription>
              </div>
            </div>
          ) : (
            <>
              <DialogTitle>Add a step</DialogTitle>
              <DialogDescription>
                Browse triggers, logic gates, and connectors.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <div className="overflow-hidden">
          <div
            className={
              selectedApp
                ? "flex w-[200%] -translate-x-1/2 transition-transform duration-300 ease-out"
                : "flex w-[200%] translate-x-0 transition-transform duration-300 ease-out"
            }
          >
            <div className="w-1/2 pr-1" inert={selectedApp ? true : undefined}>
              <Tabs defaultValue={sections[0]?.id} className="gap-3">
                <TabsList variant="line" className="h-9 w-full justify-start gap-4">
                  {sections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="flex-none px-1"
                    >
                      {section.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {sections.map((section) => (
                  <TabsContent key={section.id} value={section.id}>
                    {section.id === "connectors" ? (
                      <ScrollFade
                        className="max-h-[24rem]"
                        viewportClassName="grid gap-2 sm:grid-cols-2"
                      >
                        {apps.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            className="rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/60"
                            onClick={() => openApp(app)}
                          >
                            <p className="flex items-center gap-2 text-sm font-medium">
                              {app.iconSlug ? (
                                <BrandIcon
                                  slug={app.iconSlug}
                                  name={app.name}
                                  className="size-4"
                                />
                              ) : (
                                <NodeIcon
                                  catalogId={app.iconCatalogId}
                                  className="size-4"
                                />
                              )}
                              <span className="min-w-0 flex-1 truncate">{app.name}</span>
                              <ChevronRight className="size-4 text-muted-foreground" />
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {app.description}
                            </p>
                          </button>
                        ))}
                      </ScrollFade>
                    ) : (
                      <ScrollFade
                        className="max-h-[24rem]"
                        viewportClassName="grid gap-2 sm:grid-cols-2"
                      >
                        {section.nodes.map((node) => (
                          <NodeCard key={node.id} node={node} onChoose={choose} />
                        ))}
                      </ScrollFade>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            <div
              className="flex w-1/2 flex-col gap-3 pl-1"
              inert={selectedApp ? undefined : true}
            >
              {selectedApp ? (
                <>
                  <Tabs
                    value={methodFilter}
                    onValueChange={(value) =>
                      setMethodFilter(value as (typeof methodFilters)[number]["id"])
                    }
                    className="gap-3"
                  >
                    <TabsList variant="line" className="h-9 w-full justify-start gap-4">
                      {methodFilters.map((filter) => (
                        <TabsTrigger
                          key={filter.id}
                          value={filter.id}
                          className="flex-none px-1"
                        >
                          {filter.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <ScrollFade
                    className="max-h-[24rem]"
                    viewportClassName="grid gap-2 sm:grid-cols-2"
                  >
                    {methods.length === 0 ? (
                      <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                        No methods in this filter.
                      </p>
                    ) : (
                      methods.map((node) => (
                        <NodeCard key={node.id} node={node} onChoose={choose} />
                      ))
                    )}
                  </ScrollFade>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
