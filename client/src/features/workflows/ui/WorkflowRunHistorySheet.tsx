import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { WorkflowRunsPanel } from "./WorkflowRunsPanel"

export function WorkflowRunHistorySheet({
  open,
  onOpenChange,
  workflowId,
  workflowName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowId: string
  workflowName: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>Run history</SheetTitle>
          <SheetDescription>
            Recent executions for {workflowName}. Mocked locally until a real runner is wired.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
          <WorkflowRunsPanel
            workflowId={workflowId}
            workflowName={workflowName}
            showRunNow
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
