import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

import {
  TEAM_CAPABILITIES,
  TEAM_ROLE_PRESETS,
  type TeamCapability,
  type TeamRolePreset,
} from "../model/types"

const chipBase =
  "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

const chipIdle = "border-border bg-background text-muted-foreground hover:bg-muted/70"

const chipActive = "border-foreground bg-foreground text-background"

export function MemberFieldChooser({
  rolePreset,
  customRole,
  capabilities,
  onRolePresetChange,
  onCustomRoleChange,
  onCapabilitiesChange,
  roleError,
  idPrefix = "member",
}: {
  rolePreset: TeamRolePreset | "Custom"
  customRole: string
  capabilities: TeamCapability[]
  onRolePresetChange: (preset: TeamRolePreset | "Custom") => void
  onCustomRoleChange: (value: string) => void
  onCapabilitiesChange: (next: TeamCapability[]) => void
  roleError?: string | null
  idPrefix?: string
}) {
  function toggle(capability: TeamCapability) {
    onCapabilitiesChange(
      capabilities.includes(capability)
        ? capabilities.filter((item) => item !== capability)
        : [...capabilities, capability]
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label id={`${idPrefix}-role-label`}>Role</Label>
        <div
          role="radiogroup"
          aria-labelledby={`${idPrefix}-role-label`}
          aria-invalid={roleError ? true : undefined}
          className="flex flex-wrap gap-1.5"
        >
          {TEAM_ROLE_PRESETS.map((preset) => {
            const selected = rolePreset === preset
            return (
              <button
                key={preset}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(chipBase, selected ? chipActive : chipIdle)}
                onClick={() => onRolePresetChange(preset)}
              >
                {preset}
              </button>
            )
          })}
          <button
            type="button"
            role="radio"
            aria-checked={rolePreset === "Custom"}
            className={cn(chipBase, rolePreset === "Custom" ? chipActive : chipIdle)}
            onClick={() => onRolePresetChange("Custom")}
          >
            Custom
          </button>
        </div>
        {rolePreset === "Custom" ? (
          <Input
            id={`${idPrefix}-custom-role`}
            value={customRole}
            onChange={(event) => onCustomRoleChange(event.target.value)}
            placeholder="e.g. Lead SWE"
            aria-invalid={roleError ? true : undefined}
            aria-describedby={roleError ? `${idPrefix}-role-error` : undefined}
            autoComplete="off"
          />
        ) : null}
        {roleError ? (
          <p id={`${idPrefix}-role-error`} className="text-xs text-destructive" role="alert">
            {roleError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label id={`${idPrefix}-capabilities-label`}>Owns fields</Label>
        <p className="text-xs text-muted-foreground">
          Choose which capabilities this member owns on the team.
        </p>
        <div
          role="group"
          aria-labelledby={`${idPrefix}-capabilities-label`}
          className="flex flex-wrap gap-1.5"
        >
          {TEAM_CAPABILITIES.map((capability) => {
            const pressed = capabilities.includes(capability)
            return (
              <button
                key={capability}
                type="button"
                aria-pressed={pressed}
                className={cn(chipBase, pressed ? chipActive : chipIdle)}
                onClick={() => toggle(capability)}
              >
                {capability}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
