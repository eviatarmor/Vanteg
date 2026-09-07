import type { NodeField, WorkflowNodeType } from "./types"

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const

function httpMethodField(placeholder: string): NodeField {
  return {
    key: "method",
    label: "Method",
    placeholder,
    control: "select",
    options: HTTP_METHODS.map((value) => ({ value, label: value })),
  }
}

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

const nodeTypes: WorkflowNodeType[] = [
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
      { key: "path", label: "Path", placeholder: "/hooks/freeze" },
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
      { key: "url", label: "URL", placeholder: "https://api.example.com" },
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
  {
    id: "slack",
    label: "Send message",
    description: "Post a Slack message.",
    kind: "action",
    category: "Apps",
    fields: [
      { key: "channel", label: "Channel", placeholder: "#ops" },
      { key: "message", label: "Message", placeholder: "Workflow finished" },
    ],
  },
  {
    id: "spreadsheet",
    label: "Update row",
    description: "Create or update a spreadsheet row.",
    kind: "action",
    category: "Apps",
    fields: [{ key: "sheet", label: "Sheet", placeholder: "Leads" }],
  },
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
  {
    id: "github",
    label: "Create issue",
    description: "Create issues, comments, or pull requests.",
    kind: "action",
    category: "Apps",
    fields: [
      { key: "repo", label: "Repository", placeholder: "acme/app" },
      { key: "action", label: "Action", placeholder: "create issue" },
    ],
  },
  {
    id: "notion",
    label: "Create page",
    description: "Create or update a Notion page or database row.",
    kind: "action",
    category: "Apps",
    fields: [{ key: "page", label: "Page or database", placeholder: "Tasks" }],
  },
  {
    id: "airtable",
    label: "Create record",
    description: "Create or update an Airtable record.",
    kind: "action",
    category: "Apps",
    fields: [{ key: "base", label: "Base", placeholder: "CRM" }],
  },
  {
    id: "discord",
    label: "Send message",
    description: "Send a Discord channel message.",
    kind: "action",
    category: "Apps",
    fields: [
      { key: "channel", label: "Channel", placeholder: "#alerts" },
      { key: "message", label: "Message", placeholder: "Workflow finished" },
    ],
  },
  {
    id: "slack-new-message",
    label: "New message",
    description: "Start when a Slack message is posted.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "channel", label: "Channel", placeholder: "#ops" }],
  },
  {
    id: "slack-reaction",
    label: "New reaction",
    description: "Start when someone reacts in Slack.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "channel", label: "Channel", placeholder: "#ops" }],
  },
  {
    id: "slack-update-message",
    label: "Update message",
    description: "Edit an existing Slack message.",
    kind: "action",
    category: "Apps",
    fields: [
      { key: "channel", label: "Channel", placeholder: "#ops" },
      { key: "message", label: "Message", placeholder: "Updated text" },
    ],
  },
  {
    id: "github-new-issue",
    label: "New issue",
    description: "Start when a GitHub issue is opened.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "repo", label: "Repository", placeholder: "acme/app" }],
  },
  {
    id: "github-pull-request",
    label: "Pull request opened",
    description: "Start when a GitHub pull request is opened.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "repo", label: "Repository", placeholder: "acme/app" }],
  },
  {
    id: "github-comment",
    label: "Create comment",
    description: "Comment on a GitHub issue or pull request.",
    kind: "action",
    category: "Apps",
    fields: [
      { key: "repo", label: "Repository", placeholder: "acme/app" },
      { key: "body", label: "Comment", placeholder: "Looks good" },
    ],
  },
  {
    id: "spreadsheet-new-row",
    label: "New row",
    description: "Start when a spreadsheet row is added.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "sheet", label: "Sheet", placeholder: "Leads" }],
  },
  {
    id: "database-new-row",
    label: "New row",
    description: "Start when a database row is inserted.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "table", label: "Table", placeholder: "jobs" }],
  },
  {
    id: "notion-page-updated",
    label: "Page updated",
    description: "Start when a Notion page changes.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "page", label: "Page or database", placeholder: "Tasks" }],
  },
  {
    id: "airtable-new-record",
    label: "New record",
    description: "Start when an Airtable record is created.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "base", label: "Base", placeholder: "CRM" }],
  },
  {
    id: "discord-new-message",
    label: "New message",
    description: "Start when a Discord message is posted.",
    kind: "trigger",
    category: "Triggers",
    fields: [{ key: "channel", label: "Channel", placeholder: "#alerts" }],
  },
  method("slack-new-channel", "trigger", "New channel", "Start when a Slack channel is created.", [
    { key: "name", label: "Name contains", placeholder: "incidents" },
  ]),
  method("slack-app-mentioned", "trigger", "App mentioned", "Start when this app is mentioned in Slack.", [
    { key: "channel", label: "Channel", placeholder: "#ops" },
  ]),
  method("slack-upload-file", "action", "Upload file", "Upload a file to a Slack channel.", [
    { key: "channel", label: "Channel", placeholder: "#ops" },
    { key: "path", label: "File path", placeholder: "/tmp/report.pdf" },
  ]),
  method("slack-add-reaction", "action", "Add reaction", "React to a Slack message.", [
    { key: "channel", label: "Channel", placeholder: "#ops" },
    { key: "emoji", label: "Emoji", placeholder: "eyes" },
    { key: "ts", label: "Message ts", placeholder: "{{Webhook.ts}}" },
  ]),
  method("github-new-commit", "trigger", "New commit", "Start when a commit is pushed.", [
    { key: "repo", label: "Repository", placeholder: "acme/app" },
    { key: "branch", label: "Branch", placeholder: "main" },
  ]),
  method("github-new-release", "trigger", "Release published", "Start when a GitHub release is published.", [
    { key: "repo", label: "Repository", placeholder: "acme/app" },
  ]),
  method("github-create-pr", "action", "Create pull request", "Open a GitHub pull request.", [
    { key: "repo", label: "Repository", placeholder: "acme/app" },
    { key: "title", label: "Title", placeholder: "Fix login" },
    { key: "head", label: "Head branch", placeholder: "fix/login" },
    { key: "base", label: "Base branch", placeholder: "main" },
  ]),
  method("github-add-label", "action", "Add label", "Add a label to a GitHub issue or pull request.", [
    { key: "repo", label: "Repository", placeholder: "acme/app" },
    { key: "number", label: "Issue or PR", placeholder: "12" },
    { key: "label", label: "Label", placeholder: "bug" },
  ]),
  method("spreadsheet-updated-row", "trigger", "Updated row", "Start when a spreadsheet row changes.", [
    { key: "sheet", label: "Sheet", placeholder: "Leads" },
  ]),
  method("spreadsheet-create-row", "action", "Create row", "Append a spreadsheet row.", [
    { key: "sheet", label: "Sheet", placeholder: "Leads" },
    { key: "values", label: "Values", placeholder: "Ada, ada@acme.com", control: "textarea" },
  ]),
  method("google-drive-new-file", "trigger", "New Drive file", "Start when a file is added to Google Drive.", [
    { key: "folder", label: "Folder", placeholder: "Inbox" },
  ]),
  method("google-drive-upload", "action", "Upload Drive file", "Upload a file to Google Drive.", [
    { key: "folder", label: "Folder", placeholder: "Inbox" },
    { key: "path", label: "File path", placeholder: "/tmp/export.csv" },
  ]),
  method("notion-new-page", "trigger", "New page", "Start when a Notion page is created.", [
    { key: "page", label: "Parent page or database", placeholder: "Tasks" },
  ]),
  method("notion-new-database-item", "trigger", "New database item", "Start when a Notion database row is added.", [
    { key: "database", label: "Database", placeholder: "Tasks" },
  ]),
  method("notion-update-page", "action", "Update page", "Update a Notion page.", [
    { key: "page", label: "Page", placeholder: "Tasks" },
    { key: "content", label: "Content", placeholder: "Status: done", control: "textarea" },
  ]),
  method("notion-create-database-item", "action", "Create database item", "Add a row to a Notion database.", [
    { key: "database", label: "Database", placeholder: "Tasks" },
    { key: "title", label: "Title", placeholder: "Follow up" },
  ]),
  method("airtable-record-updated", "trigger", "Record updated", "Start when an Airtable record changes.", [
    { key: "base", label: "Base", placeholder: "CRM" },
    { key: "table", label: "Table", placeholder: "Leads" },
  ]),
  method("airtable-update-record", "action", "Update record", "Update an Airtable record.", [
    { key: "base", label: "Base", placeholder: "CRM" },
    { key: "recordId", label: "Record ID", placeholder: "rec123" },
  ]),
  method("airtable-find-records", "action", "Find records", "Search Airtable records.", [
    { key: "base", label: "Base", placeholder: "CRM" },
    { key: "formula", label: "Formula", placeholder: "{Email} = 'ada@acme.com'" },
  ]),
  method("discord-new-reaction", "trigger", "New reaction", "Start when someone reacts in Discord.", [
    { key: "channel", label: "Channel", placeholder: "#alerts" },
  ]),
  method("discord-member-joined", "trigger", "Member joined", "Start when a member joins a Discord server.", [
    { key: "server", label: "Server", placeholder: "Acme" },
  ]),
  method("discord-update-message", "action", "Update message", "Edit a Discord channel message.", [
    { key: "channel", label: "Channel", placeholder: "#alerts" },
    { key: "message", label: "Message", placeholder: "Updated text" },
  ]),
  method("discord-add-reaction", "action", "Add reaction", "React to a Discord message.", [
    { key: "channel", label: "Channel", placeholder: "#alerts" },
    { key: "emoji", label: "Emoji", placeholder: "✅" },
  ]),
  method("http-poll", "trigger", "Poll URL", "Start when an HTTP endpoint changes.", [
    httpMethodField("GET"),
    { key: "url", label: "URL", placeholder: "https://api.example.com/status" },
  ]),
  method("http-download", "action", "Download file", "Download a file over HTTP.", [
    { key: "url", label: "URL", placeholder: "https://example.com/file.csv" },
    { key: "path", label: "Save as", placeholder: "/tmp/file.csv" },
  ]),
  method("email-new-attachment", "trigger", "New attachment", "Start when an email with an attachment arrives.", [
    { key: "from", label: "From contains", placeholder: "@acme.com" },
  ]),
  method("email-reply", "action", "Reply to email", "Reply to an inbound email.", [
    { key: "to", label: "To", placeholder: "ada@acme.com" },
    { key: "body", label: "Body", placeholder: "Thanks, we got it.", control: "textarea" },
  ]),
  method("database-row-updated", "trigger", "Row updated", "Start when a database row changes.", [
    { key: "table", label: "Table", placeholder: "jobs" },
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
  method("file-delete", "action", "Delete file", "Delete a file.", [
    { key: "path", label: "Path", placeholder: "/tmp/export.csv" },
  ]),
  method("file-copy", "action", "Copy file", "Copy a file to a new path.", [
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
    fields: [{ key: "duration", label: "Duration", placeholder: "5m" }],
  },
  {
    id: "code",
    label: "Code",
    description: "Run JavaScript.",
    kind: "logic",
    category: "Logic",
    fields: [
      {
        key: "code",
        label: "Code",
        placeholder: "return items",
        control: "code",
        language: "javascript",
        help: "JavaScript that runs for each item. Return the data to pass downstream.",
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
]

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

const CONNECTOR_APPS: {
  id: string
  name: string
  description: string
  iconCatalogId: string
  iconSlug?: string
  methodIds: readonly string[]
}[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Channels, messages, and reactions.",
    iconCatalogId: "slack",
    iconSlug: "slack",
    methodIds: [
      "slack-new-message",
      "slack-reaction",
      "slack-new-channel",
      "slack-app-mentioned",
      "slack",
      "slack-update-message",
      "slack-upload-file",
      "slack-add-reaction",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Issues, pull requests, and comments.",
    iconCatalogId: "github",
    iconSlug: "github",
    methodIds: [
      "github-new-issue",
      "github-pull-request",
      "github-new-commit",
      "github-new-release",
      "github",
      "github-comment",
      "github-create-pr",
      "github-add-label",
    ],
  },
  {
    id: "google",
    name: "Google",
    description: "Spreadsheets and rows.",
    iconCatalogId: "spreadsheet",
    iconSlug: "google-sheets",
    methodIds: [
      "spreadsheet-new-row",
      "spreadsheet-updated-row",
      "google-drive-new-file",
      "spreadsheet",
      "spreadsheet-create-row",
      "google-drive-upload",
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pages and databases.",
    iconCatalogId: "notion",
    iconSlug: "notion",
    methodIds: [
      "notion-page-updated",
      "notion-new-page",
      "notion-new-database-item",
      "notion",
      "notion-update-page",
      "notion-create-database-item",
    ],
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Bases and records.",
    iconCatalogId: "airtable",
    iconSlug: "airtable",
    methodIds: [
      "airtable-new-record",
      "airtable-record-updated",
      "airtable",
      "airtable-update-record",
      "airtable-find-records",
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Servers, channels, and messages.",
    iconCatalogId: "discord",
    iconSlug: "discord",
    methodIds: [
      "discord-new-message",
      "discord-new-reaction",
      "discord-member-joined",
      "discord",
      "discord-update-message",
      "discord-add-reaction",
    ],
  },
  {
    id: "http",
    name: "HTTP",
    description: "Webhooks and REST requests.",
    iconCatalogId: "http",
    methodIds: ["webhook", "http-poll", "http", "respond-webhook", "http-download"],
  },
  {
    id: "email",
    name: "Email",
    description: "Inbound and outbound mail.",
    iconCatalogId: "email-send",
    methodIds: ["email", "email-new-attachment", "email-send", "email-reply"],
  },
  {
    id: "database",
    name: "Database",
    description: "Tables and rows.",
    iconCatalogId: "database",
    methodIds: [
      "database-new-row",
      "database-row-updated",
      "database",
      "database-update-row",
      "database-delete-row",
    ],
  },
  {
    id: "ai",
    name: "AI",
    description: "Prompts and model calls.",
    iconCatalogId: "ai",
    methodIds: ["ai-chat-received", "ai-generation-finished", "ai", "ai-classify", "ai-extract"],
  },
  {
    id: "file",
    name: "File",
    description: "Read and write files.",
    iconCatalogId: "file",
    methodIds: ["file-created", "file-updated", "file", "file-delete", "file-copy"],
  },
  {
    id: "notification",
    name: "Notification",
    description: "Push and in-app alerts.",
    iconCatalogId: "notification",
    methodIds: [
      "notification-received",
      "notification-clicked",
      "notification",
      "notification-broadcast",
    ],
  },
]

export function listConnectorApps(): ConnectorApp[] {
  return CONNECTOR_APPS.map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    iconCatalogId: app.iconCatalogId,
    iconSlug: app.iconSlug,
    methods: nodesByIds(app.methodIds),
  }))
}

export function listPickerSections(): {
  id: string
  label: string
  nodes: WorkflowNodeType[]
}[] {
  const connectorMethodIds = new Set(
    CONNECTOR_APPS.flatMap((app) => [...app.methodIds])
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
