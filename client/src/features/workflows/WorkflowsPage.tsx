import { Workflow } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

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

export function WorkflowsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  useWorkflows()
  const status = useWorkflowsStatus()
  const error = useWorkflowsError()

  function createAndOpen() {
    const workflow = createDraft()
    navigate(`/workflows/${workflow.id}`)
  }

  const { title, subtitle } = getPageCopy("/workflows")

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
            return (
              <div className="flex min-h-[28rem] flex-1 items-center justify-center">
                <Spinner className="size-6" aria-label="Loading workflows" />
              </div>
            )
          }
          if (status === "error") {
            return (
              <div className="flex min-h-[28rem] flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
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
          const statuses = tab.id === "deployed" ? (["prod"] as const) : (["draft", "dev"] as const)
          const items = listWorkflows(statuses)
          if (items.length === 0) {
            return (
              <EmptyWorkflows
                title={
                  tab.id === "deployed" ? "No production workflows" : "No draft workflows"
                }
                description="Create a workflow to start connecting triggers and actions."
                actionLabel="New workflow"
                onCreate={createAndOpen}
              />
            )
          }
          return <WorkflowList workflows={items} />
        }}
      />
    </div>
  )
}
