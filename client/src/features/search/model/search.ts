import { getAgentSnapshot } from "@/features/agents/model/store"
import { getTeamSnapshot } from "@/features/teams/model/store"
import { dataTabs } from "@/features/data/tabs"
import { listPendingInbox } from "@/features/inbox/model/store"
import { integrationTabs } from "@/features/integrations/tabs"
import { memoryTabs } from "@/features/memory/tabs"
import { getMemorySnapshot, hydrateMemoryStore } from "@/features/memory/model/store"
import { getAllNavItems, getUserMenuItems } from "@/features/shell/model/catalog"
import type { Workflow } from "@/features/workflows/model/types"

export const searchGroups = [
  "Workflows",
  "Inbox",
  "Pages",
  "Data",
  "Integrations",
  "Memory",
  "Agents",
  "Teams",
] as const

export type SearchGroup = (typeof searchGroups)[number]

export interface SearchHit {
  id: string
  title: string
  subtitle: string
  group: SearchGroup
  path: string
}

function workflowSubtitle(workflow: Workflow): string {
  const steps = workflow.nodes
    .map((node) => node.data.label)
    .filter(Boolean)
    .slice(0, 4)
  const stepText = steps.length > 0 ? steps.join(", ") : "No steps yet"
  return `${workflow.status} · ${stepText}`
}

export function buildSearchIndex(workflows: readonly Workflow[]): SearchHit[] {
  const pages: SearchHit[] = getAllNavItems().map((item) => ({
    id: `page-${item.id}`,
    title: item.label,
    subtitle: "Go to this page",
    group: "Pages",
    path: item.path,
  }))

  const settings = getUserMenuItems().find((item) => item.id === "settings")
  if (settings && "href" in settings) {
    pages.push({
      id: "page-settings",
      title: settings.label,
      subtitle: "Go to this page",
      group: "Pages",
      path: settings.href,
    })
  }

  const workflowHits: SearchHit[] = workflows.map((workflow) => ({
    id: `workflow-${workflow.id}`,
    title: workflow.name,
    subtitle: workflowSubtitle(workflow),
    group: "Workflows",
    path: `/workflows/${workflow.id}`,
  }))

  const inboxHits: SearchHit[] = listPendingInbox().map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.body,
    group: "Inbox",
    path: "/inbox",
  }))

  const dataHits: SearchHit[] = dataTabs.map((tab) => ({
    id: `data-${tab.id}`,
    title: tab.label,
    subtitle: tab.description,
    group: "Data",
    path: `/data?tab=${tab.id}`,
  }))

  const integrationHits: SearchHit[] = integrationTabs.map((tab) => ({
    id: `integration-${tab.id}`,
    title: tab.label,
    subtitle: tab.description,
    group: "Integrations",
    path: `/integrations?tab=${tab.id}`,
  }))

  hydrateMemoryStore()
  const memory = getMemorySnapshot()
  const memoryHits: SearchHit[] = [
    ...memoryTabs.map((tab) => ({
      id: `memory-tab-${tab.id}`,
      title: tab.label,
      subtitle: tab.description,
      group: "Memory" as const,
      path: `/memory?tab=${tab.id}`,
    })),
    ...memory.bases.map((base) => ({
      id: `memory-base-${base.id}`,
      title: base.name,
      subtitle: "Memory base",
      group: "Memory" as const,
      path: "/memory?tab=memory-bases",
    })),
    ...memory.knowledgeBases.map((base) => ({
      id: `knowledge-base-${base.id}`,
      title: base.name,
      subtitle: "Knowledge base",
      group: "Memory" as const,
      path: "/memory?tab=knowledge-bases",
    })),
  ]

  const agentHits: SearchHit[] = getAgentSnapshot().map((agent) => ({
    id: `agent-${agent.id}`,
    title: agent.name,
    subtitle: agent.description || "Agent",
    group: "Agents",
    path: `/agents/${agent.id}`,
  }))

  const teamHits: SearchHit[] = getTeamSnapshot().map((team) => ({
    id: `team-${team.id}`,
    title: team.name,
    subtitle: team.description || "Team",
    group: "Teams",
    path: `/teams/${team.id}`,
  }))

  return [
    ...workflowHits,
    ...inboxHits,
    ...pages,
    ...dataHits,
    ...integrationHits,
    ...memoryHits,
    ...agentHits,
    ...teamHits,
  ]
}

function matches(hit: SearchHit, query: string): boolean {
  return [hit.title, hit.subtitle, hit.group].some((part) =>
    part.toLowerCase().includes(query)
  )
}

export function searchWorkspace(
  query: string,
  workflows: readonly Workflow[]
): SearchHit[] {
  const hits = buildSearchIndex(workflows)
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return [
      ...hits.filter((hit) => hit.group === "Pages"),
      ...hits.filter((hit) => hit.group === "Inbox"),
      ...hits.filter((hit) => hit.group === "Workflows").slice(0, 5),
    ]
  }

  return hits.filter((hit) => matches(hit, normalized))
}

export function groupSearchHits(
  hits: readonly SearchHit[]
): { group: SearchGroup; hits: SearchHit[] }[] {
  return searchGroups
    .map((group) => ({
      group,
      hits: hits.filter((hit) => hit.group === group),
    }))
    .filter((entry) => entry.hits.length > 0)
}
