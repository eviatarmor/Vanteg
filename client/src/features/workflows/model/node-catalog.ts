import {
  listFeaturedMethods,
  listPickerConnectorApps,
  type ConnectorApp as IntegrationConnectorApp,
  type Method,
} from "@workspace/integrations"

import type { NodeField, WorkflowNodeType } from "./types"
import {
  httpHeadersField,
  httpMethodField,
  httpQueryField,
  httpUrlField,
  httpBodyField,
  httpTimeoutField,
} from "./http-fields"

function method(
  id: string,
  kind: "trigger" | "action",
  label: string,
  description: string,
  fields: NodeField[]
): WorkflowNodeType {
  return {
    id,
    label,
    description,
    kind,
    category: kind === "trigger" ? "Triggers" : "Apps",
    fields,
  }
}

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

const platformNodes: WorkflowNodeType[] = [
  {
    id: "manual",
    label: "Manual",
    description: "Start this workflow by hand.",
    kind: "trigger",
    category: "Triggers",
    fields: [],
  },
  {
    id: "webhook",
    label: "Webhook",
    description: "Start when an HTTP request arrives.",
    kind: "trigger",
    category: "Triggers",
    fields: [
      httpMethodField("POST"),
      { key: "path", label: "Path", placeholder: "/hooks/vanteg" },
    ],
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "Run on a cron expression or a repeating interval.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "cron", label: "Cron", placeholder: "0 9 * * 1-5" }],
  },
  {
    id: "email",
    label: "Email received",
    description: "Start when a matching email arrives.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "from", label: "From contains", placeholder: "@acme.com" }],
  },
  {
    id: "form",
    label: "Form submitted",
    description: "Start when a form is submitted.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "formId", label: "Form ID", placeholder: "contact-form" }],
  },
  {
    id: "app-event",
    label: "App event",
    description: "Start when something happens in a connected app.",
    kind: "trigger",
    category: "Triggers",
    fields: [
      { key: "app", label: "App", placeholder: "Sheets" },
      { key: "event", label: "Event", placeholder: "New row" },
    ],
  },
  {
    id: "rss",
    label: "RSS",
    description: "Start when an RSS or Atom feed has a new item.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "url", label: "Feed URL", placeholder: "https://example.com/feed" }],
  },
  {
    id: "inbound-call",
    label: "Inbound call",
    description: "Start when a phone call is received.",
    kind: "trigger",
    category: "Triggers",
    fields: [
      { key: "number", label: "Number", placeholder: "+1 555 0100", help: "The number or queue that should start this workflow." },
      { key: "route", label: "Route", placeholder: "support", help: "Optional IVR or routing key." },
    ],
  },
  {
    id: "outbound-call",
    label: "Outbound call",
    description: "Start when an outbound call is placed.",
    kind: "trigger",
    category: "Triggers",
    fields: [
      { key: "to", label: "To", placeholder: "+1 555 0199", help: "Destination number that triggers the workflow." },
      { key: "from", label: "From", placeholder: "+1 555 0100" },
    ],
  },
  {
    id: "http",
    label: "HTTP Request",
    description: "Call any REST API.",
    kind: "action",
    category: "Actions",
    fields: [
      httpMethodField("GET"),
      httpUrlField("https://api.example.com"),
      httpQueryField(),
      httpHeadersField(),
      httpBodyField(),
      httpTimeoutField(),
    ],
  },
  {
    id: "email-send",
    label: "Send email",
    description: "Send an email message.",
    kind: "action",
    category: "Actions",
    fields: [
      { key: "to", label: "To", placeholder: "team@example.com" },
      { key: "subject", label: "Subject", placeholder: "Update" },
    ],
  },
  {
    id: "notification",
    label: "Notification",
    description: "Send a push or in-app notification.",
    kind: "action",
    category: "Actions",
    fields: [{ key: "title", label: "Title", placeholder: "Done" }],
  },
  {
    id: "file",
    label: "File",
    description: "Read or write a file.",
    kind: "action",
    category: "Actions",
    fields: [{ key: "path", label: "Path", placeholder: "/tmp/export.csv" }],
  },
  {
    id: "respond-webhook",
    label: "Respond to webhook",
    description: "Return an HTTP response to the caller.",
    kind: "action",
    category: "Actions",
    fields: [
      { key: "status", label: "Status", placeholder: "200" },
      {
        key: "body",
        label: "Body",
        placeholder: '{ "ok": true }',
        control: "code",
        language: "json",
        help: "JSON payload returned to the caller.",
      },
    ],
  },
  {
    id: "ai",
    label: "AI",
    description: "Send a prompt to an AI model.",
    kind: "action",
    category: "Actions",
    fields: [{ key: "prompt", label: "Prompt", placeholder: "Summarize the input" }],
  },
  method("http-poll", "trigger", "Poll URL", "Start when an HTTP endpoint changes.", [
    httpMethodField("GET"),
    httpUrlField("https://api.example.com/status"),
    httpQueryField(),
    httpHeadersField(),
  ]),
  method("http-download", "action", "Download file", "Download a file over HTTP.", [
    httpUrlField("https://example.com/file.csv"),
    httpHeadersField(),
    { key: "path", label: "Save as", placeholder: "/tmp/file.csv" },
  ]),
  method("email-new-attachment", "trigger", "New attachment", "Start when an email with an attachment arrives.", [
    { key: "from", label: "From contains", placeholder: "@acme.com" },
  ]),
  method("email-reply", "action", "Reply to email", "Reply to an inbound email.", [
    { key: "to", label: "To", placeholder: "ada@acme.com" },
    { key: "body", label: "Body", placeholder: "Thanks, we got it.", control: "textarea" },
  ]),
  method("email-forward", "action", "Forward email", "Forward an inbound email.", [
    { key: "to", label: "To", placeholder: "ops@acme.com" },
    { key: "body", label: "Note", placeholder: "Routing to ops.", control: "textarea" },
  ]),
  method("database-new-row", "trigger", "New row", "Start when a database row is inserted.", [
    { key: "table", label: "Table", placeholder: "jobs" },
  ]),
  method("database-row-updated", "trigger", "Row updated", "Start when a database row changes.", [
    { key: "table", label: "Table", placeholder: "jobs" },
  ]),
  {
    id: "database",
    label: "Query rows",
    description: "Read or write database rows.",
    kind: "action",
    category: "Apps",
    fields: [
      { key: "operation", label: "Operation", placeholder: "insert" },
      { key: "table", label: "Table", placeholder: "jobs" },
    ],
  },
  method("database-insert-row", "action", "Insert row", "Insert a database row.", [
    { key: "table", label: "Table", placeholder: "jobs" },
    { key: "values", label: "Values", placeholder: "status=open", control: "textarea" },
  ]),
  method("database-update-row", "action", "Update row", "Update a database row.", [
    { key: "table", label: "Table", placeholder: "jobs" },
    { key: "id", label: "Row ID", placeholder: "42" },
  ]),
  method("database-delete-row", "action", "Delete row", "Delete a database row.", [
    { key: "table", label: "Table", placeholder: "jobs" },
    { key: "id", label: "Row ID", placeholder: "42" },
  ]),
  method("ai-chat-received", "trigger", "Chat message received", "Start when a chat message is sent to the model.", [
    { key: "channel", label: "Channel", placeholder: "support" },
  ]),
  method("ai-generation-finished", "trigger", "Generation finished", "Start when an AI generation completes.", [
    { key: "model", label: "Model", placeholder: "grok-4" },
  ]),
  method("ai-generation-failed", "trigger", "Generation failed", "Start when an AI generation errors.", [
    { key: "model", label: "Model", placeholder: "grok-4" },
  ]),
  method("ai-classify", "action", "Classify", "Classify text with an AI model.", [
    { key: "text", label: "Text", placeholder: "The invoice is overdue", control: "textarea" },
    { key: "labels", label: "Labels", placeholder: "urgent, billing, spam" },
  ]),
  method("ai-extract", "action", "Extract", "Extract structured fields from text.", [
    { key: "text", label: "Text", placeholder: "Ada Lovelace, ada@acme.com", control: "textarea" },
    { key: "schema", label: "Fields", placeholder: "name, email" },
  ]),
  method("file-created", "trigger", "File created", "Start when a file is created.", [
    { key: "path", label: "Path", placeholder: "/tmp/inbox" },
  ]),
  method("file-updated", "trigger", "File updated", "Start when a file changes.", [
    { key: "path", label: "Path", placeholder: "/tmp/export.csv" },
  ]),
  method("file-deleted", "trigger", "File deleted", "Start when a file is deleted.", [
    { key: "path", label: "Path", placeholder: "/tmp/inbox" },
  ]),
  method("file-delete", "action", "Delete file", "Delete a file.", [
    { key: "path", label: "Path", placeholder: "/tmp/export.csv" },
  ]),
  method("file-copy", "action", "Copy file", "Copy a file to a new path.", [
    { key: "from", label: "From", placeholder: "/tmp/export.csv" },
    { key: "to", label: "To", placeholder: "/tmp/archive/export.csv" },
  ]),
  method("file-move", "action", "Move file", "Move a file to a new path.", [
    { key: "from", label: "From", placeholder: "/tmp/export.csv" },
    { key: "to", label: "To", placeholder: "/tmp/archive/export.csv" },
  ]),
  method("notification-received", "trigger", "Notification received", "Start when an in-app notification arrives.", [
    { key: "channel", label: "Channel", placeholder: "ops" },
  ]),
  method("notification-clicked", "trigger", "Notification clicked", "Start when a notification is opened.", [
    { key: "channel", label: "Channel", placeholder: "ops" },
  ]),
  method("notification-broadcast", "action", "Broadcast", "Send a notification to a group.", [
    { key: "audience", label: "Audience", placeholder: "ops-oncall" },
    { key: "title", label: "Title", placeholder: "Incident opened" },
  ]),
  {
    id: "if",
    label: "If",
    description: "Branch true or false.",
    kind: "logic",
    category: "Logic",
    fields: [{ key: "condition", label: "Condition", placeholder: "status = open" }],
  },
  {
    id: "switch",
    label: "Switch",
    description: "Route by multiple cases.",
    kind: "logic",
    category: "Logic",
    fields: [{ key: "field", label: "Field", placeholder: "status" }],
  },
  {
    id: "filter",
    label: "Filter",
    description: "Keep only items that match a rule.",
    kind: "logic",
    category: "Logic",
    fields: [{ key: "rule", label: "Rule", placeholder: "amount > 0" }],
  },
  {
    id: "delay",
    label: "Delay",
    description: "Wait before continuing.",
    kind: "logic",
    category: "Logic",
    fields: [
      { key: "duration", label: "Duration", placeholder: "5m", help: "Wait this long, or leave empty and set Until." },
      { key: "until", label: "Until", placeholder: "2026-09-08T09:00" },
    ],
  },
  {
    id: "code",
    label: "Code",
    description: "Run JavaScript.",
    kind: "logic",
    category: "Logic",
    fields: [
      {
        key: "language",
        label: "Language",
        placeholder: "javascript",
        control: "select",
        options: [
          { value: "javascript", label: "JavaScript" },
          { value: "python", label: "Python" },
        ],
      },
      {
        key: "code",
        label: "Code",
        placeholder: "return items",
        control: "code",
        language: "javascript",
        help: "Snippet that runs for each item. Return the data to pass downstream.",
      },
    ],
  },
  {
    id: "set",
    label: "Edit fields",
    description: "Set or rename fields.",
    kind: "logic",
    category: "Logic",
    fields: [
      {
        key: "mapping",
        label: "Mapping",
        placeholder: "name = first + last",
        control: "textarea",
        help: "Assign or rename fields, one mapping per line.",
      },
    ],
  },
  {
    id: "merge",
    label: "Merge",
    description: "Combine branches.",
    kind: "logic",
    category: "Logic",
    fields: [{ key: "mode", label: "Mode", placeholder: "append" }],
  },
  {
    id: "loop",
    label: "Loop",
    description: "Iterate over items.",
    kind: "logic",
    category: "Logic",
    fields: [{ key: "items", label: "Items path", placeholder: "$.rows" }],
  },
  {
    id: "transform",
    label: "Transform",
    description: "Map, pick, or reshape data.",
    kind: "logic",
    category: "Logic",
    fields: [
      {
        key: "expression",
        label: "Expression",
        placeholder: "{{ json.body }}",
        control: "textarea",
        help: "Expression used to map or pick values from the current item.",
      },
    ],
  },
  {
    id: "paths",
    label: "Paths",
    description: "Branch into multiple conditional paths.",
    kind: "logic",
    category: "Logic",
    fields: [
      { key: "field", label: "Field", placeholder: "status" },
      {
        key: "paths",
        label: "Paths",
        placeholder: "won\nlost\nopen",
        control: "textarea",
        help: "One path per line. The workflow continues on the first matching path.",
      },
    ],
  },
  {
    id: "formatter",
    label: "Formatter",
    description: "Transform text, numbers, or dates between steps.",
    kind: "logic",
    category: "Logic",
    fields: [
      {
        key: "operation",
        label: "Operation",
        placeholder: "text",
        control: "select",
        options: [
          { value: "text", label: "Text" },
          { value: "number", label: "Number" },
          { value: "date", label: "Date" },
        ],
      },
      { key: "input", label: "Value", placeholder: "{{Webhook.body}}" },
    ],
  },
]

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
