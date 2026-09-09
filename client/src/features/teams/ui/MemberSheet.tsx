import { useEffect, useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { getAgent } from "@/features/agents/model/store"

import {
  resolveMemberRole,
  roleSelectionFromValue,
  type TeamCapability,
  type TeamNode,
  type TeamRolePreset,
} from "../model/types"
import { MemberFieldChooser } from "./MemberFieldChooser"

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
  onSave: (patch: { role: string; capabilities: TeamCapability[] }) => void
  onDelete: () => void
}) {
  const agent = node ? getAgent(node.data.agentId) : undefined
  const initial = useMemo(() => {
    if (!node) {
      return {
        preset: "Specialist" as TeamRolePreset | "Custom",
        custom: "",
        capabilities: [] as TeamCapability[],
      }
    }
    const selection = roleSelectionFromValue(node.data.role)
    return {
      preset: selection.preset,
      custom: selection.custom,
      capabilities: [...(node.data.capabilities ?? [])],
    }
  }, [node])

  const [rolePreset, setRolePreset] = useState(initial.preset)
  const [customRole, setCustomRole] = useState(initial.custom)
  const [capabilities, setCapabilities] = useState(initial.capabilities)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    setRolePreset(initial.preset)
    setCustomRole(initial.custom)
    setCapabilities(initial.capabilities)
    setRoleError(null)
    setAttempted(false)
  }, [initial])

  const resolvedRole = resolveMemberRole(rolePreset, customRole)

  function submit() {
    setAttempted(true)
    if (!node) {
      return
    }
    if (!resolvedRole) {
      setRoleError("Enter a custom role or pick a preset.")
      return
    }
    setRoleError(null)
    onSave({ role: resolvedRole, capabilities })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <SheetHeader className="border-b">
          <SheetTitle>{agent?.name ?? (node ? "Missing agent" : "Team member")}</SheetTitle>
          <SheetDescription>
            Set the role and which fields this member owns on the team graph.
          </SheetDescription>
        </SheetHeader>

        {!node ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            Loading member…
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <MemberFieldChooser
                idPrefix={`edit-${node.id}`}
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
            </div>
            <SheetFooter className="border-t sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={onDelete}>
                Remove
              </Button>
              <Button type="button" onClick={submit} disabled={!node}>
                Save member
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
