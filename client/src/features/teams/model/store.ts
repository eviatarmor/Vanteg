import { useSyncExternalStore } from "react"

import type { Team, TeamEdge, TeamNode } from "./types"

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function nextName(preferred?: string): string {
  if (preferred?.trim()) {
    return preferred.trim()
  }
  const names = new Set(teams.map((team) => team.name))
  if (!names.has("Untitled team")) {
    return "Untitled team"
  }
  let index = 2
  while (names.has(`Untitled team ${index}`)) {
    index += 1
  }
  return `Untitled team ${index}`
}

function member(
  id: string,
  agentId: string,
  role: string,
  x: number,
  y: number
): TeamNode {
  return {
    id,
    type: "agent",
    position: { x, y },
    data: { agentId, role },
  }
}

function createSeed(): Team[] {
  return [
    {
      id: "team-swe",
      name: "Software engineering",
      description: "Lead SWE orchestrates senior and junior engineers, then a reviewer.",
      nodes: [
        member("member-lead", "agent-lead-swe", "Lead SWE", 280, 40),
        member("member-senior", "agent-senior-swe", "Senior SWE", 80, 200),
        member("member-junior", "agent-junior-swe", "Junior SWE", 480, 200),
        member("member-reviewer", "agent-reviewer", "Reviewer", 280, 360),
      ],
      edges: [
        {
          id: "edge-lead-senior",
          source: "member-lead",
          target: "member-senior",
          label: "delegates",
          animated: true,
        },
        {
          id: "edge-lead-junior",
          source: "member-lead",
          target: "member-junior",
          label: "delegates",
          animated: true,
        },
        {
          id: "edge-senior-reviewer",
          source: "member-senior",
          target: "member-reviewer",
          label: "reviews",
          animated: true,
        },
        {
          id: "edge-junior-reviewer",
          source: "member-junior",
          target: "member-reviewer",
          label: "reviews",
          animated: true,
        },
      ],
      updatedAt: Date.parse("2026-04-06T08:00:00Z"),
    },
  ]
}

let teams: Team[] = createSeed()

export function subscribeTeams(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getTeamSnapshot(): Team[] {
  return teams
}

export function useTeams(): Team[] {
  return useSyncExternalStore(subscribeTeams, getTeamSnapshot, getTeamSnapshot)
}

export function resetTeams(): void {
  teams = createSeed()
  emit()
}

export function getTeam(id: string): Team | undefined {
  return teams.find((team) => team.id === id)
}

export function createTeam(name?: string): Team {
  const team: Team = {
    id: crypto.randomUUID(),
    name: nextName(name),
    description: "",
    nodes: [],
    edges: [],
    updatedAt: Date.now(),
  }
  teams = [team, ...teams]
  emit()
  return team
}

export function saveTeam(
  id: string,
  patch: Partial<Pick<Team, "name" | "description" | "nodes" | "edges">>
): Team | undefined {
  const current = getTeam(id)
  if (!current) {
    return undefined
  }
  const next: Team = { ...current, ...patch, updatedAt: Date.now() }
  teams = teams.map((team) => (team.id === id ? next : team))
  emit()
  return next
}

export function addTeamMember(
  teamId: string,
  agentId: string,
  role = "Member"
): TeamNode | undefined {
  const team = getTeam(teamId)
  if (!team) {
    return undefined
  }
  const node: TeamNode = {
    id: crypto.randomUUID(),
    type: "agent",
    position: {
      x: 80 + (team.nodes.length % 3) * 220,
      y: 80 + Math.floor(team.nodes.length / 3) * 140,
    },
    data: { agentId, role },
  }
  saveTeam(teamId, { nodes: [...team.nodes, node] })
  return node
}

export function connectTeamMembers(
  teamId: string,
  source: string,
  target: string,
  label = "handoff"
): TeamEdge | undefined {
  const team = getTeam(teamId)
  if (!team) {
    return undefined
  }
  const edge: TeamEdge = {
    id: crypto.randomUUID(),
    source,
    target,
    label,
    animated: true,
  }
  saveTeam(teamId, { edges: [...team.edges, edge] })
  return edge
}

export function updateTeamMember(
  teamId: string,
  nodeId: string,
  patch: Partial<{ agentId: string; role: string }>
): Team | undefined {
  const team = getTeam(teamId)
  if (!team) {
    return undefined
  }
  return saveTeam(teamId, {
    nodes: team.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node
    ),
  })
}

export function deleteTeamMember(teamId: string, nodeId: string): Team | undefined {
  const team = getTeam(teamId)
  if (!team) {
    return undefined
  }
  return saveTeam(teamId, {
    nodes: team.nodes.filter((node) => node.id !== nodeId),
    edges: team.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
  })
}
