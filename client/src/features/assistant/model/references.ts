import { useMemo } from "react"

import { getAgentSnapshot, useAgents } from "@/features/agents/model/store"
import type { Agent } from "@/features/agents/model/types"
import { getDataSnapshot, useDataStore } from "@/features/data/model/store"
import type {
  DatabaseTable,
  KeyValueGroup,
} from "@/features/data/model/types"
import { getConnector } from "@/features/integrations/model/catalog"
import {
  getIntegrationsSnapshot,
  useIntegrationsStore,
} from "@/features/integrations/model/store"
import type { ConnectorConnection } from "@/features/integrations/model/types"
import { getMemorySnapshot, useMemoryStore } from "@/features/memory/model/store"
import type {
  KnowledgeBase,
  KnowledgeDocument,
  MemoryBase,
  MemoryEntry,
} from "@/features/memory/model/types"
import { getTeamSnapshot, useTeams } from "@/features/teams/model/store"
import type { Team } from "@/features/teams/model/types"
import {
  getWorkflowSnapshot,
  useWorkflows,
} from "@/features/workflows/model/store"
import type { Workflow } from "@/features/workflows/model/types"

import type { AssistantReference } from "./types"

export const REFERENCE_CONTEXT_LIMIT = 8_000
const TABLE_ROW_LIMIT = 20
const SHEET_ROW_LIMIT = 20

export function referenceKey(
  ref: Pick<AssistantReference, "kind" | "id">
): string {
  return `${ref.kind}:${ref.id}`
}

function boundContext(value: string): string {
  if (value.length <= REFERENCE_CONTEXT_LIMIT) {
    return value
  }
  return value.slice(0, REFERENCE_CONTEXT_LIMIT)
}

function agentContext(agent: Agent): string {
  const lines = [
    `Agent: ${agent.name}`,
    agent.description ? `Description: ${agent.description}` : "",
    agent.instructions ? `Instructions: ${agent.instructions}` : "",
    agent.memoryBaseIds.length
      ? `Memory bases: ${agent.memoryBaseIds.join(", ")}`
      : "",
    agent.knowledgeBaseIds.length
      ? `Knowledge bases: ${agent.knowledgeBaseIds.join(", ")}`
      : "",
    agent.workflowIds.length
      ? `Workflows: ${agent.workflowIds.join(", ")}`
      : "",
    agent.capabilityIds.length
      ? `Capabilities: ${agent.capabilityIds.join(", ")}`
      : "",
  ]
  return boundContext(lines.filter(Boolean).join("\n"))
}

function teamContext(team: Team, agentsById: Map<string, Agent>): string {
  const members = team.nodes.map((node) => {
    const agent = agentsById.get(node.data.agentId)
    const name = agent?.name ?? node.data.agentId
    const role = node.data.role
    const instructions = agent?.instructions
      ? `Instructions: ${agent.instructions}`
      : ""
    return [`Member: ${name}`, `Role: ${role}`, instructions]
      .filter(Boolean)
      .join("\n")
  })
  return boundContext(
    [
      `Team: ${team.name}`,
      team.description ? `Description: ${team.description}` : "",
      ...members,
    ]
      .filter(Boolean)
      .join("\n\n")
  )
}

function workflowContext(workflow: Workflow): string {
  const steps = workflow.nodes.map(
    (node) => `- ${node.data.label} (${node.data.catalogId})`
  )
  return boundContext(
    [
      `Workflow: ${workflow.name}`,
      `Status: ${workflow.status}`,
      steps.length ? `Steps:\n${steps.join("\n")}` : "Steps: none",
    ].join("\n")
  )
}

function tableContext(table: DatabaseTable, schemaName: string): string {
  const columns = table.columns
    .map((column) => `${column.name} (${column.variant})`)
    .join(", ")
  const rows = table.rows.slice(0, TABLE_ROW_LIMIT).map((row) => {
    const cells = table.columns
      .map((column) => `${column.name}=${String(row[column.id] ?? "")}`)
      .join(", ")
    return `- ${row.id}: ${cells}`
  })
  return boundContext(
    [
      `Table: ${table.name}`,
      `Schema: ${schemaName}`,
      `Columns: ${columns}`,
      rows.length ? `Rows (max ${TABLE_ROW_LIMIT}):\n${rows.join("\n")}` : "Rows: none",
    ].join("\n")
  )
}

function variableGroupContext(group: KeyValueGroup): string {
  const items = group.items.map((item) => `${item.key}=${item.value}`).join("\n")
  return boundContext(`Variable group: ${group.name}\n${items}`)
}

function memoryContext(base: MemoryBase, entries: MemoryEntry[]): string {
  const lines = entries.map((entry) => `- ${entry.content}`)
  return boundContext(
    [
      `Memory base: ${base.name}`,
      base.description ? `Description: ${base.description}` : "",
      lines.length ? `Entries:\n${lines.join("\n")}` : "Entries: none",
    ]
      .filter(Boolean)
      .join("\n")
  )
}

function knowledgeContext(
  base: KnowledgeBase,
  documents: KnowledgeDocument[]
): string {
  const docs = documents.map((document) => {
    const body = document.text?.trim() ? `\n${document.text}` : ""
    return `- ${document.name} (${document.type}, ${document.size} bytes)${body}`
  })
  return boundContext(
    [
      `Knowledge base: ${base.name}`,
      base.description ? `Description: ${base.description}` : "",
      docs.length ? `Documents:\n${docs.join("\n")}` : "Documents: none",
    ]
      .filter(Boolean)
      .join("\n")
  )
}

function sheetSummary(
  label: string,
  rows: Array<Record<string, unknown>>
): string {
  const limited = rows.slice(0, SHEET_ROW_LIMIT).map((row) => {
    const entries = Object.entries(row)
      .filter(([key]) => key !== "id")
      .map(([key, value]) => `${key}=${String(value ?? "")}`)
    return `- ${entries.join(", ")}`
  })
  if (!limited.length) {
    return `${label}: none`
  }
  return `${label}:\n${limited.join("\n")}`
}

function connectorContext(connection: ConnectorConnection): string {
  const connector = getConnector(connection.connectorId)
  return boundContext(
    [
      `Connection: ${connection.name}`,
      `Connector: ${connector?.name ?? connection.connectorId}`,
      `Connector id: ${connection.connectorId}`,
      connector?.description ? `Description: ${connector.description}` : "",
      sheetSummary("In", connection.sheets.in),
      sheetSummary("Data", connection.sheets.data),
      sheetSummary("Out", connection.sheets.out),
    ]
      .filter(Boolean)
      .join("\n")
  )
}

function buildCatalog(input: {
  agents: Agent[]
  teams: Team[]
  workflows: Workflow[]
  tables: Array<{ table: DatabaseTable; schemaName: string }>
  variableGroups: KeyValueGroup[]
  memoryBases: MemoryBase[]
  memories: MemoryEntry[]
  knowledgeBases: KnowledgeBase[]
  documents: KnowledgeDocument[]
  connections: ConnectorConnection[]
}): AssistantReference[] {
  const agentsById = new Map(input.agents.map((agent) => [agent.id, agent]))

  const refs: AssistantReference[] = []

  for (const agent of input.agents) {
    refs.push({
      kind: "agent",
      id: agent.id,
      label: agent.name,
      description: agent.description || undefined,
      context: agentContext(agent),
    })
  }

  for (const team of input.teams) {
    refs.push({
      kind: "team",
      id: team.id,
      label: team.name,
      description: team.description || undefined,
      context: teamContext(team, agentsById),
    })
  }

  for (const workflow of input.workflows) {
    refs.push({
      kind: "workflow",
      id: workflow.id,
      label: workflow.name,
      context: workflowContext(workflow),
    })
  }

  for (const { table, schemaName } of input.tables) {
    refs.push({
      kind: "table",
      id: table.id,
      label: table.name,
      description: schemaName,
      context: tableContext(table, schemaName),
    })
  }

  for (const group of input.variableGroups) {
    refs.push({
      kind: "variable-group",
      id: group.id,
      label: group.name,
      context: variableGroupContext(group),
    })
  }

  for (const base of input.memoryBases) {
    refs.push({
      kind: "memory",
      id: base.id,
      label: base.name,
      description: base.description || undefined,
      context: memoryContext(
        base,
        input.memories.filter((entry) => entry.baseId === base.id)
      ),
    })
  }

  for (const base of input.knowledgeBases) {
    refs.push({
      kind: "knowledge",
      id: base.id,
      label: base.name,
      description: base.description || undefined,
      context: knowledgeContext(
        base,
        input.documents.filter(
          (document) => document.knowledgeBaseId === base.id
        )
      ),
    })
  }

  for (const connection of input.connections) {
    const connector = getConnector(connection.connectorId)
    refs.push({
      kind: "connector",
      id: connection.id,
      label: connection.name || connector?.name || connection.connectorId,
      description: connector?.description,
      context: connectorContext(connection),
    })
  }

  return refs
}

export function getAssistantReferenceCatalog(): AssistantReference[] {
  const agents = getAgentSnapshot()
  const teams = getTeamSnapshot()
  const workflows = getWorkflowSnapshot()
  const data = getDataSnapshot()
  const memory = getMemorySnapshot()
  const integrations = getIntegrationsSnapshot()
  const tables = data.databases.flatMap((database) =>
    database.schemas.flatMap((schema) =>
      schema.tables.map((table) => ({
        table,
        schemaName: `${database.name}.${schema.name}`,
      }))
    )
  )
  return buildCatalog({
    agents,
    teams,
    workflows,
    tables,
    variableGroups: data.variableGroups,
    memoryBases: memory.bases,
    memories: memory.memories,
    knowledgeBases: memory.knowledgeBases,
    documents: memory.documents,
    connections: integrations.connections,
  })
}

export function useAssistantReferenceCatalog(): AssistantReference[] {
  const agents = useAgents()
  const teams = useTeams()
  const workflows = useWorkflows()
  const data = useDataStore()
  const memory = useMemoryStore()
  const integrations = useIntegrationsStore()

  return useMemo(() => {
    const tables = data.databases.flatMap((database) =>
      database.schemas.flatMap((schema) =>
        schema.tables.map((table) => ({
          table,
          schemaName: `${database.name}.${schema.name}`,
        }))
      )
    )
    return buildCatalog({
      agents,
      teams,
      workflows,
      tables,
      variableGroups: data.variableGroups,
      memoryBases: memory.bases,
      memories: memory.memories,
      knowledgeBases: memory.knowledgeBases,
      documents: memory.documents,
      connections: integrations.connections,
    })
  }, [agents, teams, workflows, data, memory, integrations])
}
