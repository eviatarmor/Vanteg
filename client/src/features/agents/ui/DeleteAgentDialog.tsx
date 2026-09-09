import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Spinner } from "@workspace/ui/components/spinner"

import { deleteAgent } from "../model/store"
import type { Agent } from "../model/types"

export function DeleteAgentDialog({
  agent,
  open,
  onOpenChange,
  onDeleted,
}: {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: (agentId: string) => void
}) {
  const [pending, setPending] = useState(false)

  async function confirmDelete() {
    if (!agent) return
    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 120))
      const removed = deleteAgent(agent.id)
      if (removed) {
        toast.success(`Deleted ${agent.name}`)
        onOpenChange(false)
        onDeleted?.(agent.id)
      } else {
        toast.error("Could not delete this agent.")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete agent</DialogTitle>
          <DialogDescription>
            Permanently remove “{agent?.name ?? "this agent"}”? Assigned memory,
            knowledge, and workflows stay in the workspace, but this agent
            configuration cannot be recovered.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDelete}
            disabled={pending || !agent}
          >
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
