import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import { cn } from "@workspace/ui/lib/utils"

import { useAgents } from "@/features/agents/model/store"
import { AgentIcon } from "@/features/agents/ui/AgentIcon"

import {
  resolveMemberRole,
  type TeamCapability,
  type TeamRolePreset,
} from "../model/types"
import { MemberFieldChooser } from "./MemberFieldChooser"

export function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (agentId: string, role: string, capabilities: TeamCapability[]) => void
}) {
  const agents = useAgents()
  const [agentId, setAgentId] = useState<string | null>(null)
  const [rolePreset, setRolePreset] = useState<TeamRolePreset | "Custom">("Specialist")
  const [customRole, setCustomRole] = useState("")
  const [capabilities, setCapabilities] = useState<TeamCapability[]>([])
  const [roleError, setRoleError] = useState<string | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)

  function reset() {
    setAgentId(null)
    setRolePreset("Specialist")
    setCustomRole("")
    setCapabilities([])
    setRoleError(null)
    setAgentError(null)
    setAttempted(false)
  }

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open])

  const resolvedRole = resolveMemberRole(rolePreset, customRole)

  function submit() {
    setAttempted(true)
    let valid = true
    if (!agentId) {
      setAgentError("Select an agent to add.")
      valid = false
    } else {
      setAgentError(null)
    }
    if (!resolvedRole) {
      setRoleError("Enter a custom role or pick a preset.")
      valid = false
    } else {
      setRoleError(null)
    }
    if (!valid || !agentId) {
      return
    }
    onAdd(agentId, resolvedRole, capabilities)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-4 pb-3">
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Pick an agent, choose a role, and assign the fields they own.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[min(70vh,32rem)] gap-4 overflow-y-auto p-4">
          <MemberFieldChooser
            idPrefix="add-member"
            rolePreset={rolePreset}
            customRole={customRole}
            capabilities={capabilities}
            roleError={attempted ? roleError : null}
            onRolePresetChange={(preset) => {
              setRolePreset(preset)
              setRoleError(null)
            }}
            onCustomRoleChange={(value) => {
              setCustomRole(value)
              setRoleError(null)
            }}
            onCapabilitiesChange={setCapabilities}
          />

          <div className="grid gap-2">
            <p id="add-member-agent-label" className="text-sm font-medium">
              Agent
            </p>
            {agents.length === 0 ? (
              <div
                className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground"
                role="status"
              >
                No agents yet. Create an agent first, then add them to this team.
              </div>
            ) : (
              <ScrollFade className="max-h-48" viewportClassName="grid gap-1">
                <div
                  role="listbox"
                  aria-labelledby="add-member-agent-label"
                  aria-invalid={attempted && agentError ? true : undefined}
                >
                  {agents.map((agent) => {
                    const selected = agentId === agent.id
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          selected
                            ? "border-foreground bg-muted font-medium"
                            : "border-border hover:bg-muted/70"
                        )}
                        onClick={() => {
                          setAgentId(agent.id)
                          setAgentError(null)
                        }}
                      >
                        <AgentIcon id={agent.icon} />
                        <span className="min-w-0 flex-1 truncate">{agent.name}</span>
                      </button>
                    )
                  })}
                </div>
              </ScrollFade>
            )}
            {attempted && agentError ? (
              <p className="text-xs text-destructive" role="alert">
                {agentError}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="border-t p-4 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={agents.length === 0}>
            Add member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
