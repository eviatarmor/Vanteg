import type { NodeField, WorkflowNodeType } from "./types"
import {
  aiPromptField,
  aiModelField,
  aiTemperatureField,
  databaseOperationField,
  databaseQueryField,
  databaseTableField,
} from "./ai-db-fields"
import {
  emailBodyField,
  emailCcField,
  emailSubjectField,
  emailToField,
  formIdField,
} from "./email-form-fields"
import {
  httpBodyField,
  httpHeadersField,
  httpMethodField,
  httpQueryField,
  httpTimeoutField,
  httpUrlField,
} from "./http-fields"
import { logicGateNodes } from "./logic-nodes"

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

export const platformNodes: WorkflowNodeType[] = [
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
    fields: [formIdField()],
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
      emailToField("team@example.com"),
      emailCcField(),
      emailSubjectField("Update"),
      emailBodyField("Thanks, we got it."),
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
    fields: [
      aiPromptField("Summarize the input"),
      aiModelField(),
      aiTemperatureField(),
    ],
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
    emailToField("ada@acme.com"),
    emailCcField(),
    emailSubjectField("Re: Update"),
    emailBodyField("Thanks, we got it."),
  ]),
  method("email-forward", "action", "Forward email", "Forward an inbound email.", [
    emailToField("ops@acme.com"),
    emailCcField(),
    emailSubjectField("Fwd: Update"),
    emailBodyField("Routing to ops.", "Note"),
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
      databaseOperationField("insert"),
      databaseTableField("jobs"),
      databaseQueryField(),
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
    aiPromptField("The invoice is overdue"),
    { key: "labels", label: "Labels", placeholder: "urgent, billing, spam" },
    aiModelField(),
    aiTemperatureField(),
  ]),
  method("ai-extract", "action", "Extract", "Extract structured fields from text.", [
    aiPromptField("Ada Lovelace, ada@acme.com"),
    { key: "schema", label: "Fields", placeholder: "name, email" },
    aiModelField(),
    aiTemperatureField(),
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
  ...logicGateNodes,
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
