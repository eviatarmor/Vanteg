import {
  listFeaturedMethods,
  listPickerConnectorApps,
  type ConnectorApp as IntegrationConnectorApp,
  type Method,
} from "@workspace/integrations"

import type { WorkflowNodeType } from "./types"
import { platformNodes } from "./platform-nodes"

function toNode(item: Method): WorkflowNodeType {
  return {
    id: item.id,
    label: item.label,
    description: item.description,
    kind: item.kind,
    category: item.kind === "trigger" ? "Triggers" : "Apps",
    fields: item.fields.map((field) => ({ ...field })),
  }
}


const nodeTypes: WorkflowNodeType[] = [...platformNodes, ...listFeaturedMethods().map(toNode)]
const nodeTypesById = new Map(nodeTypes.map((node) => [node.id, node]))

const COMMON_TRIGGER_IDS = [
  "manual",
  "webhook",
  "schedule",
  "inbound-call",
  "outbound-call",
]
const COMMON_INTEGRATION_IDS = [
  "http",
  "email-send",
  "slack",
  "spreadsheet",
  "database",
]

function nodesByIds(ids: readonly string[]): WorkflowNodeType[] {
  return ids.flatMap((id) => {
    const node = nodeTypesById.get(id)
    return node ? [node] : []
  })
}

export function listNodeTypes(): WorkflowNodeType[] {
  return nodeTypes
}

export function getNodeType(id: string): WorkflowNodeType | undefined {
  return nodeTypesById.get(id)
}

export function nodeTypesByCategory(): { category: string; nodes: WorkflowNodeType[] }[] {
  const groups = new Map<string, WorkflowNodeType[]>()
  for (const node of nodeTypes) {
    const list = groups.get(node.category) ?? []
    list.push(node)
    groups.set(node.category, list)
  }
  return [...groups.entries()].map(([category, nodes]) => ({ category, nodes }))
}

export function listCommonTriggers(): WorkflowNodeType[] {
  return nodesByIds(COMMON_TRIGGER_IDS)
}

export function listLogicGates(): WorkflowNodeType[] {
  return nodeTypes.filter((node) => node.kind === "logic")
}

export function listCommonIntegrations(): WorkflowNodeType[] {
  return nodesByIds(COMMON_INTEGRATION_IDS)
}

export function listConnectors(): WorkflowNodeType[] {
  return nodeTypes.filter((node) => node.kind === "action")
}

export interface ConnectorApp {
  id: string
  name: string
  description: string
  iconCatalogId: string
  iconSlug?: string
  methods: WorkflowNodeType[]
}

const PLATFORM_APPS: ConnectorApp[] = [
  {
    id: "http",
    name: "HTTP",
    description: "Webhooks and REST requests.",
    iconCatalogId: "http",
    methods: nodesByIds(["webhook", "http-poll", "http", "respond-webhook", "http-download"]),
  },
  {
    id: "email",
    name: "Email",
    description: "Inbound and outbound mail.",
    iconCatalogId: "email-send",
    methods: nodesByIds(["email", "email-new-attachment", "email-send", "email-reply", "email-forward"]),
  },
  {
    id: "database",
    name: "Database",
    description: "Tables and rows.",
    iconCatalogId: "database",
    methods: nodesByIds([
      "database-new-row",
      "database-row-updated",
      "database",
      "database-insert-row",
      "database-update-row",
      "database-delete-row",
    ]),
  },
  {
    id: "ai",
    name: "AI",
    description: "Prompts and model calls.",
    iconCatalogId: "ai",
    methods: nodesByIds([
      "ai-chat-received",
      "ai-generation-finished",
      "ai-generation-failed",
      "ai",
      "ai-classify",
      "ai-extract",
    ]),
  },
  {
    id: "file",
    name: "File",
    description: "Read and write files.",
    iconCatalogId: "file",
    methods: nodesByIds([
      "file-created",
      "file-updated",
      "file-deleted",
      "file",
      "file-delete",
      "file-copy",
      "file-move",
    ]),
  },
  {
    id: "notification",
    name: "Notification",
    description: "Push and in-app alerts.",
    iconCatalogId: "notification",
    methods: nodesByIds([
      "notification-received",
      "notification-clicked",
      "notification",
      "notification-broadcast",
    ]),
  },
]

function toConnectorApp(app: IntegrationConnectorApp): ConnectorApp {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    iconCatalogId: app.iconCatalogId,
    iconSlug: app.iconSlug,
    methods: app.methods.map(toNode),
  }
}

export function listConnectorApps(): ConnectorApp[] {
  return [...listPickerConnectorApps().map(toConnectorApp), ...PLATFORM_APPS]
}

export function listPickerSections(): {
  id: string
  label: string
  nodes: WorkflowNodeType[]
}[] {
  const connectorMethodIds = new Set(
    listConnectorApps().flatMap((app) => app.methods.map((item) => item.id))
  )
  return [
    {
      id: "triggers",
      label: "Triggers",
      nodes: nodeTypes.filter(
        (node) => node.kind === "trigger" && !connectorMethodIds.has(node.id)
      ),
    },
    { id: "logic", label: "Logic gates", nodes: listLogicGates() },
    { id: "connectors", label: "Connectors", nodes: [] },
  ]
}
