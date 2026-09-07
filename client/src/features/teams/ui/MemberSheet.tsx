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

import { getAgent } from "@/features/agents/model/store"

import type { TeamNode } from "../model/types"

export function MemberSheet({
  node,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: {
  node: TeamNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: string) => void
  onDelete: () => void
}) {
  const agent = node ? getAgent(node.data.agentId) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent?.name ?? "Team member"}</DialogTitle>
          <DialogDescription>Set how this agent is used on the team graph.</DialogDescription>
        </DialogHeader>
        {node ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              onSave(String(form.get("role") ?? node.data.role))
              onOpenChange(false)
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="edit-member-role">Role</Label>
              <Input
                id="edit-member-role"
                name="role"
                defaultValue={node.data.role}
                key={node.id}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onDelete}>
                Remove
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
