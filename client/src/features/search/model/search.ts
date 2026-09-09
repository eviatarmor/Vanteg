import { getAgentSnapshot } from "@/features/agents/model/store"
import type { Agent } from "@/features/agents/model/types"
import { getTeamSnapshot } from "@/features/teams/model/store"
import { dataTabs } from "@/features/data/tabs"
import { listPendingInbox } from "@/features/inbox/model/store"
import { integrationTabs } from "@/features/integrations/tabs"
import { memoryTabs } from "@/features/memory/tabs"
import { getMemorySnapshot, hydrateMemoryStore } from "@/features/memory/model/store"
import { getAllNavItems, getUserMenuItems } from "@/features/shell/model/catalog"
import type { Workflow } from "@/features/workflows/model/types"

export const searchGroups = [
  "Actions",
  "Workflows",
  "Agents",
  "Inbox",
  "Pages",
  "Data",
  "Integrations",
  "Memory",
  "Teams",
] as const

export type SearchGroup = (typeof searchGroups)[number]

export type SearchCommand =
  | "create-workflow"
  | "create-agent"
  | "create-team"
  | "open-assistant"

export interface SearchHit {
  id: string
  title: string
  subtitle: string
  group: SearchGroup
  path: string
  keywords?: string[]
  command?: SearchCommand
}

const RECENT_LIMIT = 5

function workflowSubtitle(workflow: Workflow): string {
  const steps = workflow.nodes
    .map((node) => node.data.label)
    .filter(Boolean)
    .slice(0, 4)
  const stepText = steps.length > 0 ? steps.join(", ") : "No steps yet"
  return `${workflow.status} · ${stepText}`
}

function byUpdatedAtDesc<T extends { updatedAt: number }>(left: T, right: T): number {
  return right.updatedAt - left.updatedAt
}

function actionHits(): SearchHit[] {
  return [
    {
      id: "action-create-workflow",
      title: "Create workflow",
      subtitle: "Start a new draft workflow",
      group: "Actions",
      path: "/workflows",
      command: "create-workflow",
      keywords: ["new", "add", "draft"],
    },
    {
      id: "action-create-agent",
      title: "Create agent",
      subtitle: "Add a new agent to this workspace",
      group: "Actions",
      path: "/agents",
      command: "create-agent",
      keywords: ["new", "add", "bot"],
    },
    {
      id: "action-create-team",
      title: "Create team",
      subtitle: "Orchestrate agents as a team",
      group: "Actions",
      path: "/teams",
      command: "create-team",
      keywords: ["new", "add"],
    },
    {
      id: "action-open-assistant",
      title: "Open Assistant",
      subtitle: "Ask Vanteg on this page",
      group: "Actions",
      path: "/",
      command: "open-assistant",
      keywords: ["ask", "vanteg", "chat", "help"],
    },
    {
      id: "action-go-integrations",
      title: "Go to Integrations",
      subtitle: "Open connected apps",
      group: "Actions",
      path: "/integrations",
      keywords: ["go", "jump", "connect"],
    },
    {
      id: "action-go-templates",
      title: "Go to Templates",
      subtitle: "Browse industry playbooks",
      group: "Actions",
      path: "/templates",
      keywords: ["go", "jump", "playbook", "industry"],
    },
    {
      id: "action-go-settings",
      title: "Go to Settings",
      subtitle: "Workspace and account preferences",
      group: "Actions",
      path: "/settings",
      keywords: ["go", "jump", "preferences", "account"],
    },
    {
      id: "action-go-inbox",
      title: "Go to Inbox",
      subtitle: "Review pending approvals",
      group: "Actions",
      path: "/inbox",
      keywords: ["go", "jump", "approvals"],
    },
    {
      id: "action-go-data",
      title: "Go to Data",
      subtitle: "Tables, variables, and secrets",
      group: "Actions",
      path: "/data",
      keywords: ["go", "jump", "tables", "variables", "secrets"],
    },
  ]
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

  // Templates is not in the shell nav on master yet; keep it searchable as a page jump.
  if (!pages.some((page) => page.path === "/templates")) {
    pages.push({
      id: "page-templates",
      title: "Templates",
      subtitle: "Go to this page",
      group: "Pages",
      path: "/templates",
    })
  }

  const workflowHits: SearchHit[] = [...workflows]
    .sort(byUpdatedAtDesc)
    .map((workflow) => ({
      id: `workflow-${workflow.id}`,
      title: workflow.name,
      subtitle: workflowSubtitle(workflow),
      group: "Workflows",
      path: `/workflows/${workflow.id}`,
      keywords: ["recent", "workflow"],
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

  const agentHits: SearchHit[] = [...getAgentSnapshot()]
    .sort(byUpdatedAtDesc)
    .map((agent: Agent) => ({
      id: `agent-${agent.id}`,
      title: agent.name,
      subtitle: agent.description || "Agent",
      group: "Agents" as const,
      path: `/agents/${agent.id}`,
      keywords: ["recent", "agent"],
    }))

  const teamHits: SearchHit[] = getTeamSnapshot().map((team) => ({
    id: `team-${team.id}`,
    title: team.name,
    subtitle: team.description || "Team",
    group: "Teams",
    path: `/teams/${team.id}`,
  }))

  return [
    ...actionHits(),
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
  const haystack = [hit.title, hit.subtitle, hit.group, ...(hit.keywords ?? [])]
    .join(" ")
    .toLowerCase()
  if (haystack.includes(query)) {
    return true
  }
  const words = query.split(/\s+/).filter(Boolean)
  return words.length > 0 && words.every((word) => haystack.includes(word))
}

export function searchWorkspace(
  query: string,
  workflows: readonly Workflow[]
): SearchHit[] {
  const hits = buildSearchIndex(workflows)
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return [
      ...hits.filter((hit) => hit.group === "Actions"),
      ...hits.filter((hit) => hit.group === "Workflows").slice(0, RECENT_LIMIT),
      ...hits.filter((hit) => hit.group === "Agents").slice(0, RECENT_LIMIT),
      ...hits.filter((hit) => hit.group === "Pages"),
      ...hits.filter((hit) => hit.group === "Inbox"),
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
