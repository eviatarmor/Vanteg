import { useNavigate, useParams } from "react-router"

import { Button } from "@workspace/ui/components/button"

import { getWorkflow, useWorkflows } from "./model/store"
import { WorkflowCanvas } from "./ui/WorkflowCanvas"

export function WorkflowEditorPage() {
  const { workflowId } = useParams()
  useWorkflows()
  const navigate = useNavigate()
  const workflow = workflowId ? getWorkflow(workflowId) : undefined

  if (!workflow) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">This workflow was not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/workflows")}>
          Back to workflows
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <WorkflowCanvas key={workflow.id} workflow={workflow} />
    </div>
  )
}
