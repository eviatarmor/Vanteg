import { useState } from "react"

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
import { ScrollFade } from "@workspace/ui/components/scroll-fade"

import { useAgents } from "@/features/agents/model/store"
import { AgentIcon } from "@/features/agents/ui/AgentIcon"

export function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (agentId: string, role: string) => void
}) {
  const agents = useAgents()
  const [role, setRole] = useState("Member")

  function choose(agentId: string) {
    onAdd(agentId, role.trim() || "Member")
    setRole("Member")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setRole("Member")
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Pick an agent and the role it plays on this team graph.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="member-role">Role</Label>
          <Input
            id="member-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Lead SWE"
          />
        </div>
        <ScrollFade className="max-h-64" viewportClassName="grid gap-1">
          {agents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted/70"
              onClick={() => choose(agent.id)}
            >
              <AgentIcon id={agent.icon} />
              <span className="min-w-0 flex-1 truncate">{agent.name}</span>
            </button>
          ))}
        </ScrollFade>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
