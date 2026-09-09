import { FlaskConical, Play, Rocket } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { saveWorkflow } from "../model/store"

export function WorkflowRunBar({
  workflowId,
  workflowName,
}: {
  workflowId: string
  workflowName: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1 shadow-sm">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => toast.message(`Tested ${workflowName}`)}
      >
        <FlaskConical />
        Test
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => toast.success(`Running ${workflowName}`)}
      >
        <Play />
        Run
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={() => {
          saveWorkflow(workflowId, { status: "prod" })
          toast.success(`Deployed ${workflowName}`)
        }}
      >
        <Rocket />
        Deploy
      </Button>
    </div>
  )
}
