import type { Edge, Node } from "@xyflow/react"

export const TEAM_ROLE_PRESETS = [
  "Lead",
  "Researcher",
  "Writer",
  "Reviewer",
  "Specialist",
] as const

export type TeamRolePreset = (typeof TEAM_ROLE_PRESETS)[number]

export const TEAM_CAPABILITIES = [
  "Inbox",
  "Workflows",
  "Knowledge",
  "Tools",
  "Approvals",
] as const

export type TeamCapability = (typeof TEAM_CAPABILITIES)[number]

export interface TeamMemberData {
  agentId: string
  /** Display role — a preset label or a custom string. */
  role: string
  /** Capability / field ownership chips for this member. */
  capabilities: TeamCapability[]
}

export type TeamNode = Node<TeamMemberData, "agent">
export type TeamEdge = Edge

export interface Team {
  id: string
  name: string
  description: string
  nodes: TeamNode[]
  edges: TeamEdge[]
  updatedAt: number
}

export function isTeamRolePreset(value: string): value is TeamRolePreset {
  return (TEAM_ROLE_PRESETS as readonly string[]).includes(value)
}

export function isTeamCapability(value: string): value is TeamCapability {
  return (TEAM_CAPABILITIES as readonly string[]).includes(value)
}

/** Resolve UI selection from a stored role string. */
export function roleSelectionFromValue(role: string): {
  preset: TeamRolePreset | "Custom"
  custom: string
} {
  if (isTeamRolePreset(role)) {
    return { preset: role, custom: "" }
  }
  return { preset: "Custom", custom: role }
}

export function resolveMemberRole(
  preset: TeamRolePreset | "Custom",
  custom: string
): string {
  if (preset === "Custom") {
    return custom.trim()
  }
  return preset
}

export function toggleCapability(
  current: TeamCapability[],
  capability: TeamCapability
): TeamCapability[] {
  return current.includes(capability)
    ? current.filter((item) => item !== capability)
    : [...current, capability]
}
