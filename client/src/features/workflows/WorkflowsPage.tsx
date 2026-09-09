import { useMemo, useState } from "react"
import { Search, Workflow } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import {
  createDraft,
  listWorkflows,
  retryWorkflowsLoad,
  useWorkflows,
  useWorkflowsError,
  useWorkflowsStatus,
} from "./model/store"
import { workflowTabs } from "./tabs"
import { EmptyWorkflows } from "./ui/EmptyWorkflows"
import { WorkflowList } from "./ui/WorkflowList"
import { WorkflowsSkeleton } from "./ui/WorkflowsSkeleton"

export function WorkflowsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  useWorkflows()
  const status = useWorkflowsStatus()
  const error = useWorkflowsError()
  const [query, setQuery] = useState("")

  function createAndOpen() {
    const workflow = createDraft()
    navigate(`/workflows/${workflow.id}`)
  }

  function browseTemplates() {
    navigate("/templates")
  }

  const { title, subtitle } = getPageCopy("/workflows")
  const normalizedQuery = query.trim().toLowerCase()

  const filterByQuery = useMemo(
    () =>
      function filterWorkflows<T extends { name: string }>(items: T[]): T[] {
        if (!normalizedQuery) {
          return items
        }
        return items.filter((item) =>
          item.name.toLowerCase().includes(normalizedQuery)
        )
      },
    [normalizedQuery]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTabs
        title={title}
        subtitle={subtitle}
        icon={Workflow}
        tabs={workflowTabs}
        defaultTab={searchParams.get("tab") ?? undefined}
        onNew={createAndOpen}
        renderPanel={(tab) => {
          if (status === "loading" || status === "idle") {
            return <WorkflowsSkeleton />
          }
          if (status === "error") {
            return (
              <div
                role="alert"
                className="flex min-h-[28rem] flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
              >
                <p className="text-sm font-medium">Couldn’t load workflows</p>
                <p className="text-sm text-muted-foreground">{error ?? "Something went wrong."}</p>
                <Button type="button" size="sm" onClick={() => retryWorkflowsLoad()}>
                  Retry
                </Button>
              </div>
            )
          }
          if (tab.id === "runs") {
            return (
              <EmptyWorkflows
                title="No runs yet"
                description="Runs will show up here after a workflow executes."
              />
            )
          }

          const statuses =
            tab.id === "deployed" ? (["prod"] as const) : (["draft", "dev"] as const)
          const items = listWorkflows(statuses)
          const filtered = filterByQuery(items)

          if (items.length === 0) {
            return (
              <EmptyWorkflows
                title={
                  tab.id === "deployed" ? "No production workflows" : "No draft workflows"
                }
                description="Create a workflow to start connecting triggers and actions, or browse templates for a head start."
                actionLabel="New workflow"
                onCreate={createAndOpen}
                onBrowseTemplates={browseTemplates}
              />
            )
          }

          return (
            <div className="grid gap-4">
              <div className="relative max-w-sm">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search workflows"
                  aria-label="Search workflows"
                  className="pl-9"
                />
              </div>
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No workflows match “{query.trim()}”.
                </p>
              ) : (
                <WorkflowList workflows={filtered} />
              )}
            </div>
          )
        }}
      />
    </div>
  )
}
