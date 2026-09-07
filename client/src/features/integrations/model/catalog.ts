import type {
  Connector,
  ConnectorAuth,
  ConnectorCategory,
  FieldVariant,
  SheetField,
} from "./types"

type Template =
  | "sheet"
  | "email"
  | "chat"
  | "crm"
  | "issue"
  | "file"
  | "calendar"
  | "payment"
  | "ai"
  | "db"
  | "event"
  | "sms"
  | "analytics"
  | "identity"
  | "commerce"
  | "ticket"
  | "form"
  | "deploy"
  | "search"

function field(
  id: string,
  name: string,
  variant: FieldVariant = "short-text",
  extra: Partial<SheetField> = {}
): SheetField {
  return { id, name, variant, ...extra }
}

function select(id: string, name: string, options: string[], extra: Partial<SheetField> = {}): SheetField {
  return field(id, name, "select", {
    options: options.map((value) => ({ label: value, value })),
    ...extra,
  })
}

const templates: Record<Template, { in: SheetField[]; data: SheetField[]; out: SheetField[] }> = {
  sheet: {
    in: [
      field("spreadsheetId", "Spreadsheet ID", "short-text", {
        required: true,
        defaultValue: "1freeze-demo-sheet",
      }),
      field("sheetName", "Sheet name", "short-text", { required: true, defaultValue: "Sheet1" }),
      field("range", "Range", "short-text", { defaultValue: "A:D" }),
      select("operation", "Operation", ["append", "update", "read", "clear"], {
        required: true,
        defaultValue: "append",
      }),
    ],
    data: [
      field("name", "Name", "short-text", { required: true }),
      field("email", "Email", "short-text", { required: true }),
      field("company", "Company"),
      select("status", "Status", ["active", "pending", "archived"], { defaultValue: "active" }),
    ],
    out: [
      field("spreadsheetId", "Spreadsheet ID"),
      field("updatedRange", "Updated range"),
      field("updatedRows", "Updated rows", "number"),
      field("updatedCells", "Updated cells", "number"),
      field("status", "Status"),
    ],
  },
  email: {
    in: [
      field("from", "From"),
      field("to", "To", "short-text", { required: true }),
      field("subject", "Subject", "short-text", { required: true }),
      field("body", "Body", "long-text", { required: true }),
      select("operation", "Operation", ["send", "reply", "draft"], { defaultValue: "send" }),
    ],
    data: [
      field("to", "To", "short-text", { required: true }),
      field("subject", "Subject", "short-text", { required: true }),
      field("body", "Body", "long-text", { required: true }),
      field("cc", "Cc"),
    ],
    out: [
      field("messageId", "Message ID"),
      field("threadId", "Thread ID"),
      field("labelIds", "Labels"),
      field("status", "Status"),
    ],
  },
  chat: {
    in: [
      field("channel", "Channel", "short-text", { required: true }),
      field("text", "Text", "long-text", { required: true }),
      field("threadTs", "Thread ts"),
      select("operation", "Operation", ["post", "update", "react"], { defaultValue: "post" }),
    ],
    data: [
      field("channel", "Channel", "short-text", { required: true }),
      field("text", "Text", "long-text", { required: true }),
      field("username", "Username"),
    ],
    out: [
      field("ts", "Timestamp"),
      field("channel", "Channel"),
      field("ok", "Ok", "checkbox"),
    ],
  },
  crm: {
    in: [
      select("object", "Object", ["contact", "company", "deal"], { required: true, defaultValue: "contact" }),
      select("operation", "Operation", ["create", "update", "upsert", "get"], { defaultValue: "create" }),
      field("id", "Record ID"),
    ],
    data: [
      field("email", "Email", "short-text", { required: true }),
      field("firstName", "First name"),
      field("lastName", "Last name"),
      field("company", "Company"),
      select("status", "Status", ["new", "open", "won", "lost"], { defaultValue: "new" }),
    ],
    out: [
      field("id", "Record ID"),
      field("email", "Email"),
      field("status", "Status"),
      field("url", "URL", "url"),
    ],
  },
  issue: {
    in: [
      field("project", "Project", "short-text", { required: true }),
      select("operation", "Operation", ["create", "update", "comment"], { defaultValue: "create" }),
      field("assignee", "Assignee"),
    ],
    data: [
      field("title", "Title", "short-text", { required: true }),
      field("body", "Body", "long-text"),
      field("assignee", "Assignee"),
      field("labels", "Labels"),
      select("status", "Status", ["open", "in_progress", "done"], { defaultValue: "open" }),
    ],
    out: [
      field("id", "ID"),
      field("number", "Number", "number"),
      field("url", "URL", "url"),
      field("status", "Status"),
    ],
  },
  file: {
    in: [
      field("folderId", "Folder ID"),
      field("path", "Path"),
      select("operation", "Operation", ["upload", "list", "download", "delete"], {
        defaultValue: "upload",
      }),
    ],
    data: [
      field("name", "Name", "short-text", { required: true }),
      field("mimeType", "MIME type"),
      field("content", "Content", "long-text"),
      field("path", "Path"),
    ],
    out: [
      field("fileId", "File ID"),
      field("url", "URL", "url"),
      field("mimeType", "MIME type"),
      field("status", "Status"),
    ],
  },
  calendar: {
    in: [
      field("calendarId", "Calendar ID", "short-text", { defaultValue: "primary" }),
      select("operation", "Operation", ["create", "update", "list"], { defaultValue: "create" }),
    ],
    data: [
      field("summary", "Summary", "short-text", { required: true }),
      field("start", "Start", "date", { required: true }),
      field("end", "End", "date", { required: true }),
      field("attendees", "Attendees"),
      field("location", "Location"),
    ],
    out: [
      field("eventId", "Event ID"),
      field("htmlLink", "Link", "url"),
      field("status", "Status"),
    ],
  },
  payment: {
    in: [
      field("customerId", "Customer ID"),
      field("currency", "Currency", "short-text", { defaultValue: "usd" }),
      select("operation", "Operation", ["create", "capture", "refund"], { defaultValue: "create" }),
    ],
    data: [
      field("email", "Email", "short-text", { required: true }),
      field("amount", "Amount", "number", { required: true }),
      field("currency", "Currency", "short-text", { defaultValue: "usd" }),
      field("description", "Description"),
    ],
    out: [
      field("id", "Payment ID"),
      field("status", "Status"),
      field("receiptUrl", "Receipt", "url"),
    ],
  },
  ai: {
    in: [
      field("model", "Model", "short-text", { required: true }),
      field("temperature", "Temperature", "number", { defaultValue: 0.2 }),
      select("operation", "Operation", ["generate", "embed", "moderate"], { defaultValue: "generate" }),
    ],
    data: [
      field("prompt", "Prompt", "long-text", { required: true }),
      field("system", "System", "long-text"),
      field("input", "Input", "long-text"),
    ],
    out: [
      field("output", "Output", "long-text"),
      field("model", "Model"),
      field("usage", "Usage"),
      field("status", "Status"),
    ],
  },
  db: {
    in: [
      field("table", "Table", "short-text", { required: true }),
      field("query", "Query", "long-text"),
      select("operation", "Operation", ["insert", "update", "select", "delete"], {
        defaultValue: "insert",
      }),
    ],
    data: [
      field("id", "Record ID"),
      field("payload", "Payload", "long-text", { required: true }),
      field("filter", "Filter"),
    ],
    out: [
      field("id", "Record ID"),
      field("rows", "Rows", "number"),
      field("status", "Status"),
    ],
  },
  event: {
    in: [
      field("eventType", "Event type"),
      select("operation", "Operation", ["create", "cancel", "list"], { defaultValue: "create" }),
    ],
    data: [
      field("email", "Email", "short-text", { required: true }),
      field("name", "Name"),
      field("startTime", "Start time", "date"),
      field("eventType", "Event type"),
    ],
    out: [
      field("id", "Event ID"),
      field("joinUrl", "Join URL", "url"),
      field("status", "Status"),
    ],
  },
  sms: {
    in: [
      field("from", "From", "short-text", { required: true }),
      select("operation", "Operation", ["send", "status"], { defaultValue: "send" }),
    ],
    data: [
      field("to", "To", "short-text", { required: true }),
      field("body", "Body", "long-text", { required: true }),
      field("mediaUrl", "Media URL", "url"),
    ],
    out: [
      field("sid", "SID"),
      field("to", "To"),
      field("status", "Status"),
    ],
  },
  analytics: {
    in: [
      field("projectId", "Project ID", "short-text", { required: true }),
      field("event", "Event"),
      select("operation", "Operation", ["track", "identify", "group"], { defaultValue: "track" }),
    ],
    data: [
      field("userId", "User ID", "short-text", { required: true }),
      field("event", "Event", "short-text", { required: true }),
      field("properties", "Properties", "long-text"),
    ],
    out: [
      field("id", "Event ID"),
      field("receivedAt", "Received at", "date"),
      field("status", "Status"),
    ],
  },
  identity: {
    in: [
      field("connection", "Connection"),
      select("operation", "Operation", ["create", "update", "disable"], { defaultValue: "create" }),
    ],
    data: [
      field("email", "Email", "short-text", { required: true }),
      field("name", "Name"),
      field("role", "Role"),
    ],
    out: [
      field("userId", "User ID"),
      field("email", "Email"),
      field("status", "Status"),
    ],
  },
  commerce: {
    in: [
      select("resource", "Resource", ["order", "product", "customer"], {
        required: true,
        defaultValue: "order",
      }),
      select("operation", "Operation", ["create", "update", "fulfill"], { defaultValue: "create" }),
    ],
    data: [
      field("email", "Email", "short-text", { required: true }),
      field("sku", "SKU"),
      field("quantity", "Quantity", "number", { defaultValue: 1 }),
      field("total", "Total", "number"),
    ],
    out: [
      field("id", "ID"),
      field("orderNumber", "Order number"),
      field("status", "Status"),
    ],
  },
  ticket: {
    in: [
      field("inbox", "Inbox"),
      select("operation", "Operation", ["create", "update", "reply"], { defaultValue: "create" }),
    ],
    data: [
      field("subject", "Subject", "short-text", { required: true }),
      field("body", "Body", "long-text", { required: true }),
      field("email", "Requester email"),
      select("priority", "Priority", ["low", "normal", "high", "urgent"], { defaultValue: "normal" }),
    ],
    out: [
      field("id", "Ticket ID"),
      field("url", "URL", "url"),
      field("status", "Status"),
    ],
  },
  form: {
    in: [
      field("formId", "Form ID", "short-text", { required: true }),
      select("operation", "Operation", ["submit", "list"], { defaultValue: "submit" }),
    ],
    data: [
      field("email", "Email", "short-text", { required: true }),
      field("name", "Name"),
      field("answer", "Answer", "long-text"),
    ],
    out: [
      field("responseId", "Response ID"),
      field("submittedAt", "Submitted at", "date"),
      field("status", "Status"),
    ],
  },
  deploy: {
    in: [
      field("project", "Project", "short-text", { required: true }),
      select("operation", "Operation", ["deploy", "promote", "rollback"], { defaultValue: "deploy" }),
    ],
    data: [
      field("branch", "Branch", "short-text", { defaultValue: "main" }),
      field("commit", "Commit"),
      field("env", "Environment", "long-text"),
    ],
    out: [
      field("deployId", "Deploy ID"),
      field("url", "URL", "url"),
      field("status", "Status"),
    ],
  },
  search: {
    in: [
      field("index", "Index", "short-text", { required: true }),
      select("operation", "Operation", ["upsert", "search", "delete"], { defaultValue: "upsert" }),
    ],
    data: [
      field("objectId", "Object ID", "short-text", { required: true }),
      field("title", "Title"),
      field("body", "Body", "long-text"),
    ],
    out: [
      field("objectId", "Object ID"),
      field("taskId", "Task ID"),
      field("status", "Status"),
    ],
  },
}

function oauth(oauthAppId: string): ConnectorAuth {
  return { kind: "oauth2", oauthAppId }
}

const apiKey: ConnectorAuth = { kind: "api-key" }
const jwt: ConnectorAuth = { kind: "jwt" }
const basic: ConnectorAuth = { kind: "basic" }
const bearer: ConnectorAuth = { kind: "bearer" }
const serviceAccount: ConnectorAuth = { kind: "service-account" }

interface ConnectorDef {
  id: string
  name: string
  category: ConnectorCategory
  icon: string
  auth: ConnectorAuth
  description: string
  template: Template
}

const defs: ConnectorDef[] = [
  { id: "google-sheets", name: "Google Sheets", category: "Google", icon: "google-sheets", auth: oauth("google"), description: "Append, update, and read spreadsheet rows.", template: "sheet" },
  { id: "gmail", name: "Gmail", category: "Google", icon: "gmail", auth: oauth("google"), description: "Send, reply, and draft Gmail messages.", template: "email" },
  { id: "google-drive", name: "Google Drive", category: "Google", icon: "google-drive", auth: oauth("google"), description: "Upload and list Drive files.", template: "file" },
  { id: "google-calendar", name: "Google Calendar", category: "Google", icon: "google-calendar", auth: oauth("google"), description: "Create and update calendar events.", template: "calendar" },
  { id: "google-docs", name: "Google Docs", category: "Google", icon: "google-docs", auth: oauth("google"), description: "Create and edit Google documents.", template: "file" },
  { id: "google-contacts", name: "Google Contacts", category: "Google", icon: "google", auth: oauth("google"), description: "Create and update people in Contacts.", template: "crm" },
  { id: "google-chat", name: "Google Chat", category: "Google", icon: "google-chat", auth: oauth("google"), description: "Post messages to Chat spaces.", template: "chat" },
  { id: "google-tasks", name: "Google Tasks", category: "Google", icon: "google-tasks", auth: oauth("google"), description: "Add and complete Google Tasks.", template: "issue" },
  { id: "google-analytics", name: "Google Analytics", category: "Google", icon: "google-analytics", auth: oauth("google"), description: "Read GA4 reports and events.", template: "analytics" },
  { id: "youtube", name: "YouTube", category: "Google", icon: "youtube", auth: oauth("google"), description: "Upload and manage YouTube videos.", template: "file" },
  { id: "google-ads", name: "Google Ads", category: "Google", icon: "google-ads", auth: oauth("google"), description: "Create campaigns and ads.", template: "analytics" },
  { id: "google-meet", name: "Google Meet", category: "Google", icon: "google-meet", auth: oauth("google"), description: "Create Meet conference spaces.", template: "event" },
  { id: "google-bigquery", name: "BigQuery", category: "Google", icon: "google-bigquery", auth: oauth("google"), description: "Run queries and insert table rows.", template: "db" },
  { id: "google-cloud-storage", name: "Cloud Storage", category: "Google", icon: "google-cloud-storage", auth: oauth("google"), description: "Read and write GCS objects.", template: "file" },
  { id: "google-forms", name: "Google Forms", category: "Google", icon: "google-forms", auth: oauth("google"), description: "Collect form responses.", template: "form" },
  { id: "outlook-mail", name: "Outlook Mail", category: "Microsoft", icon: "microsoft-outlook", auth: oauth("microsoft"), description: "Send and read Outlook email.", template: "email" },
  { id: "outlook-calendar", name: "Outlook Calendar", category: "Microsoft", icon: "microsoft-outlook", auth: oauth("microsoft"), description: "Create Outlook calendar events.", template: "calendar" },
  { id: "microsoft-teams", name: "Microsoft Teams", category: "Microsoft", icon: "microsoft-teams", auth: oauth("microsoft"), description: "Post to Teams channels and chats.", template: "chat" },
  { id: "onedrive", name: "OneDrive", category: "Microsoft", icon: "microsoft-onedrive", auth: oauth("microsoft"), description: "Upload and list OneDrive files.", template: "file" },
  { id: "sharepoint", name: "SharePoint", category: "Microsoft", icon: "microsoft-sharepoint", auth: oauth("microsoft"), description: "Read and write SharePoint lists.", template: "sheet" },
  { id: "excel-online", name: "Excel Online", category: "Microsoft", icon: "microsoft-excel", auth: oauth("microsoft"), description: "Insert rows into Excel workbooks.", template: "sheet" },
  { id: "microsoft-todo", name: "Microsoft To Do", category: "Microsoft", icon: "microsoft-todo", auth: oauth("microsoft"), description: "Create To Do tasks.", template: "issue" },
  { id: "microsoft-planner", name: "Microsoft Planner", category: "Microsoft", icon: "microsoft-planner", auth: oauth("microsoft"), description: "Create Planner tasks and buckets.", template: "issue" },
  { id: "dynamics-365", name: "Dynamics 365", category: "Microsoft", icon: "microsoft-dynamics-365", auth: oauth("microsoft"), description: "Create Dynamics CRM records.", template: "crm" },
  { id: "azure-devops", name: "Azure DevOps", category: "Microsoft", icon: "azure-azure-devops", auth: oauth("microsoft"), description: "Create work items and comments.", template: "issue" },
  { id: "slack", name: "Slack", category: "Communication", icon: "slack", auth: oauth("slack"), description: "Post messages, threads, and reactions.", template: "chat" },
  { id: "discord", name: "Discord", category: "Communication", icon: "discord", auth: oauth("discord"), description: "Send messages to Discord channels.", template: "chat" },
  { id: "telegram", name: "Telegram", category: "Communication", icon: "telegram", auth: apiKey, description: "Send Telegram bot messages.", template: "chat" },
  { id: "whatsapp", name: "WhatsApp", category: "Communication", icon: "whatsapp", auth: apiKey, description: "Send WhatsApp Business messages.", template: "sms" },
  { id: "twilio", name: "Twilio", category: "Communication", icon: "twilio", auth: apiKey, description: "Send SMS and voice messages.", template: "sms" },
  { id: "zoom", name: "Zoom", category: "Communication", icon: "zoom", auth: oauth("zoom"), description: "Create Zoom meetings.", template: "event" },
  { id: "intercom", name: "Intercom", category: "Support", icon: "intercom", auth: oauth("intercom"), description: "Create Intercom conversations.", template: "ticket" },
  { id: "front", name: "Front", category: "Support", icon: "front", auth: oauth("front"), description: "Create Front conversations.", template: "ticket" },
  { id: "help-scout", name: "Help Scout", category: "Support", icon: "helpscout", auth: oauth("helpscout"), description: "Create Help Scout conversations.", template: "ticket" },
  { id: "zendesk", name: "Zendesk", category: "Support", icon: "zendesk", auth: oauth("zendesk"), description: "Create and update Zendesk tickets.", template: "ticket" },
  { id: "aircall", name: "Aircall", category: "Communication", icon: "aircall", auth: apiKey, description: "Log and trigger Aircall calls.", template: "sms" },
  { id: "hubspot", name: "HubSpot", category: "CRM", icon: "hubspot", auth: oauth("hubspot"), description: "Create HubSpot contacts and deals.", template: "crm" },
  { id: "salesforce", name: "Salesforce", category: "CRM", icon: "salesforce", auth: oauth("salesforce"), description: "Create Salesforce records.", template: "crm" },
  { id: "pipedrive", name: "Pipedrive", category: "CRM", icon: "pipedrive", auth: oauth("pipedrive"), description: "Create Pipedrive deals and people.", template: "crm" },
  { id: "zoho-crm", name: "Zoho CRM", category: "CRM", icon: "zoho", auth: oauth("zoho"), description: "Create Zoho CRM records.", template: "crm" },
  { id: "attio", name: "Attio", category: "CRM", icon: "attio", auth: apiKey, description: "Create Attio people and companies.", template: "crm" },
  { id: "github", name: "GitHub", category: "Developer", icon: "github", auth: oauth("github"), description: "Create issues, PRs, and comments.", template: "issue" },
  { id: "gitlab", name: "GitLab", category: "Developer", icon: "gitlab", auth: oauth("gitlab"), description: "Create GitLab issues and notes.", template: "issue" },
  { id: "bitbucket", name: "Bitbucket", category: "Developer", icon: "bitbucket", auth: oauth("bitbucket"), description: "Create Bitbucket issues and PRs.", template: "issue" },
  { id: "linear", name: "Linear", category: "Project", icon: "linear", auth: oauth("linear"), description: "Create Linear issues.", template: "issue" },
  { id: "jira", name: "Jira", category: "Project", icon: "jira", auth: oauth("atlassian"), description: "Create Jira issues.", template: "issue" },
  { id: "confluence", name: "Confluence", category: "Project", icon: "confluence", auth: oauth("atlassian"), description: "Create Confluence pages.", template: "file" },
  { id: "asana", name: "Asana", category: "Project", icon: "asana", auth: oauth("asana"), description: "Create Asana tasks.", template: "issue" },
  { id: "trello", name: "Trello", category: "Project", icon: "trello", auth: oauth("trello"), description: "Create Trello cards.", template: "issue" },
  { id: "clickup", name: "ClickUp", category: "Project", icon: "clickup", auth: oauth("clickup"), description: "Create ClickUp tasks.", template: "issue" },
  { id: "notion", name: "Notion", category: "Project", icon: "notion", auth: oauth("notion"), description: "Create Notion pages and database rows.", template: "sheet" },
  { id: "monday", name: "Monday.com", category: "Project", icon: "monday", auth: oauth("monday"), description: "Create Monday items.", template: "issue" },
  { id: "shortcut", name: "Shortcut", category: "Project", icon: "shortcut", auth: apiKey, description: "Create Shortcut stories.", template: "issue" },
  { id: "basecamp", name: "Basecamp", category: "Project", icon: "basecamp", auth: apiKey, description: "Create Basecamp to-dos.", template: "issue" },
  { id: "coda", name: "Coda", category: "Project", icon: "coda", auth: apiKey, description: "Insert Coda table rows.", template: "sheet" },
  { id: "todoist", name: "Todoist", category: "Project", icon: "todoist", auth: apiKey, description: "Create Todoist tasks.", template: "issue" },
  { id: "stripe", name: "Stripe", category: "Payments", icon: "stripe", auth: apiKey, description: "Create customers, invoices, and charges.", template: "payment" },
  { id: "paypal", name: "PayPal", category: "Payments", icon: "paypal", auth: oauth("paypal"), description: "Create PayPal payments.", template: "payment" },
  { id: "square", name: "Square", category: "Payments", icon: "square", auth: oauth("square"), description: "Create Square payments.", template: "payment" },
  { id: "paddle", name: "Paddle", category: "Payments", icon: "paddle", auth: apiKey, description: "Create Paddle transactions.", template: "payment" },
  { id: "braintree", name: "Braintree", category: "Payments", icon: "braintree", auth: apiKey, description: "Create Braintree transactions.", template: "payment" },
  { id: "adyen", name: "Adyen", category: "Payments", icon: "adyen", auth: apiKey, description: "Create Adyen payments.", template: "payment" },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing", icon: "mailchimp", auth: oauth("mailchimp"), description: "Add Mailchimp subscribers.", template: "crm" },
  { id: "mailgun", name: "Mailgun", category: "Marketing", icon: "mailgun", auth: apiKey, description: "Send Mailgun email.", template: "email" },
  { id: "postmark", name: "Postmark", category: "Marketing", icon: "postmark", auth: apiKey, description: "Send Postmark email.", template: "email" },
  { id: "resend", name: "Resend", category: "Marketing", icon: "resend", auth: apiKey, description: "Send Resend email.", template: "email" },
  { id: "sendgrid", name: "SendGrid", category: "Marketing", icon: "twilio", auth: apiKey, description: "Send SendGrid email.", template: "email" },
  { id: "brevo", name: "Brevo", category: "Marketing", icon: "brevo", auth: apiKey, description: "Send Brevo campaigns and email.", template: "email" },
  { id: "customerio", name: "Customer.io", category: "Marketing", icon: "customerio", auth: apiKey, description: "Identify people and track events.", template: "analytics" },
  { id: "braze", name: "Braze", category: "Marketing", icon: "braze", auth: apiKey, description: "Send Braze canvas and campaign events.", template: "analytics" },
  { id: "airtable", name: "Airtable", category: "Storage", icon: "airtable", auth: oauth("airtable"), description: "Create Airtable records.", template: "sheet" },
  { id: "dropbox", name: "Dropbox", category: "Storage", icon: "dropbox", auth: oauth("dropbox"), description: "Upload Dropbox files.", template: "file" },
  { id: "box", name: "Box", category: "Storage", icon: "box", auth: oauth("box"), description: "Upload Box files.", template: "file" },
  { id: "aws-s3", name: "Amazon S3", category: "Storage", icon: "aws", auth: apiKey, description: "Put and list S3 objects.", template: "file" },
  { id: "postgresql", name: "PostgreSQL", category: "Databases", icon: "postgresql", auth: basic, description: "Insert and query Postgres rows.", template: "db" },
  { id: "mysql", name: "MySQL", category: "Databases", icon: "mysql", auth: basic, description: "Insert and query MySQL rows.", template: "db" },
  { id: "mongodb", name: "MongoDB", category: "Databases", icon: "mongodb", auth: basic, description: "Insert MongoDB documents.", template: "db" },
  { id: "redis", name: "Redis", category: "Databases", icon: "redis", auth: basic, description: "Set and get Redis keys.", template: "db" },
  { id: "snowflake", name: "Snowflake", category: "Databases", icon: "snowflake", auth: jwt, description: "Run Snowflake statements.", template: "db" },
  { id: "supabase", name: "Supabase", category: "Databases", icon: "supabase", auth: apiKey, description: "Insert Supabase table rows.", template: "db" },
  { id: "firebase", name: "Firebase", category: "Databases", icon: "firebase", auth: serviceAccount, description: "Write Firestore documents.", template: "db" },
  { id: "planetscale", name: "PlanetScale", category: "Databases", icon: "planetscale", auth: apiKey, description: "Insert PlanetScale rows.", template: "db" },
  { id: "elasticsearch", name: "Elasticsearch", category: "Databases", icon: "elasticsearch", auth: basic, description: "Index Elasticsearch documents.", template: "search" },
  { id: "openai", name: "OpenAI", category: "AI", icon: "openai", auth: apiKey, description: "Generate completions and embeddings.", template: "ai" },
  { id: "anthropic", name: "Anthropic", category: "AI", icon: "anthropic", auth: apiKey, description: "Generate Claude completions.", template: "ai" },
  { id: "google-gemini", name: "Google Gemini", category: "AI", icon: "google-gemini", auth: apiKey, description: "Generate Gemini completions.", template: "ai" },
  { id: "hugging-face", name: "Hugging Face", category: "AI", icon: "hugging-face", auth: apiKey, description: "Call Hugging Face inference.", template: "ai" },
  { id: "replicate", name: "Replicate", category: "AI", icon: "replicate", auth: apiKey, description: "Run Replicate models.", template: "ai" },
  { id: "cohere", name: "Cohere", category: "AI", icon: "cohere", auth: apiKey, description: "Generate Cohere completions.", template: "ai" },
  { id: "mistral", name: "Mistral", category: "AI", icon: "mistral", auth: apiKey, description: "Generate Mistral completions.", template: "ai" },
  { id: "groq", name: "Groq", category: "AI", icon: "groq", auth: apiKey, description: "Generate Groq completions.", template: "ai" },
  { id: "perplexity", name: "Perplexity", category: "AI", icon: "perplexity", auth: apiKey, description: "Run Perplexity searches.", template: "ai" },
  { id: "xai", name: "xAI", category: "AI", icon: "xai", auth: apiKey, description: "Generate Grok completions.", template: "ai" },
  { id: "pinecone", name: "Pinecone", category: "AI", icon: "pinecone", auth: apiKey, description: "Upsert Pinecone vectors.", template: "search" },
  { id: "x", name: "X", category: "Social", icon: "x", auth: oauth("x"), description: "Post tweets on X.", template: "chat" },
  { id: "linkedin", name: "LinkedIn", category: "Social", icon: "linkedin", auth: oauth("linkedin"), description: "Share LinkedIn posts.", template: "chat" },
  { id: "facebook", name: "Facebook", category: "Social", icon: "facebook", auth: oauth("facebook"), description: "Publish Facebook page posts.", template: "chat" },
  { id: "instagram", name: "Instagram", category: "Social", icon: "instagram", auth: oauth("facebook"), description: "Publish Instagram media.", template: "file" },
  { id: "reddit", name: "Reddit", category: "Social", icon: "reddit", auth: oauth("reddit"), description: "Submit Reddit posts.", template: "chat" },
  { id: "pinterest", name: "Pinterest", category: "Social", icon: "pinterest", auth: oauth("pinterest"), description: "Create Pinterest pins.", template: "file" },
  { id: "tiktok", name: "TikTok", category: "Social", icon: "tiktok", auth: oauth("tiktok"), description: "Upload TikTok videos.", template: "file" },
  { id: "buffer", name: "Buffer", category: "Social", icon: "buffer", auth: oauth("buffer"), description: "Schedule Buffer posts.", template: "chat" },
  { id: "shopify", name: "Shopify", category: "Commerce", icon: "shopify", auth: oauth("shopify"), description: "Create Shopify orders and products.", template: "commerce" },
  { id: "woocommerce", name: "WooCommerce", category: "Commerce", icon: "woocommerce", auth: apiKey, description: "Create WooCommerce orders.", template: "commerce" },
  { id: "amazon", name: "Amazon", category: "Commerce", icon: "amazon", auth: apiKey, description: "Create Amazon marketplace orders.", template: "commerce" },
  { id: "ebay", name: "eBay", category: "Commerce", icon: "ebay", auth: oauth("ebay"), description: "Create eBay listings and orders.", template: "commerce" },
  { id: "bigcommerce", name: "BigCommerce", category: "Commerce", icon: "bigcommerce", auth: apiKey, description: "Create BigCommerce orders.", template: "commerce" },
  { id: "magento", name: "Magento", category: "Commerce", icon: "magento", auth: jwt, description: "Create Magento orders.", template: "commerce" },
  { id: "mixpanel", name: "Mixpanel", category: "Analytics", icon: "mixpanel", auth: apiKey, description: "Track Mixpanel events.", template: "analytics" },
  { id: "amplitude", name: "Amplitude", category: "Analytics", icon: "amplitude", auth: apiKey, description: "Track Amplitude events.", template: "analytics" },
  { id: "posthog", name: "PostHog", category: "Analytics", icon: "posthog", auth: apiKey, description: "Capture PostHog events.", template: "analytics" },
  { id: "heap", name: "Heap", category: "Analytics", icon: "heap", auth: apiKey, description: "Track Heap events.", template: "analytics" },
  { id: "workday", name: "Workday", category: "HR", icon: "workday", auth: jwt, description: "Create Workday workers.", template: "identity" },
  { id: "greenhouse", name: "Greenhouse", category: "HR", icon: "greenhouse", auth: apiKey, description: "Create Greenhouse candidates.", template: "identity" },
  { id: "gusto", name: "Gusto", category: "HR", icon: "gusto", auth: oauth("gusto"), description: "Create Gusto employees.", template: "identity" },
  { id: "rippling", name: "Rippling", category: "HR", icon: "rippling", auth: oauth("rippling"), description: "Create Rippling employees.", template: "identity" },
  { id: "personio", name: "Personio", category: "HR", icon: "personio", auth: apiKey, description: "Create Personio employees.", template: "identity" },
  { id: "adp", name: "ADP", category: "HR", icon: "adp", auth: apiKey, description: "Create ADP workers.", template: "identity" },
  { id: "calendly", name: "Calendly", category: "Support", icon: "calendly", auth: oauth("calendly"), description: "Create Calendly events.", template: "event" },
  { id: "typeform", name: "Typeform", category: "Support", icon: "typeform", auth: oauth("typeform"), description: "Collect Typeform responses.", template: "form" },
  { id: "surveymonkey", name: "SurveyMonkey", category: "Support", icon: "surveymonkey", auth: oauth("surveymonkey"), description: "Collect SurveyMonkey responses.", template: "form" },
  { id: "docusign", name: "DocuSign", category: "Finance", icon: "docusign", auth: oauth("docusign"), description: "Send DocuSign envelopes.", template: "file" },
  { id: "pagerduty", name: "PagerDuty", category: "Infra", icon: "pagerduty", auth: apiKey, description: "Create PagerDuty incidents.", template: "ticket" },
  { id: "datadog", name: "Datadog", category: "Infra", icon: "datadog", auth: apiKey, description: "Submit Datadog events.", template: "analytics" },
  { id: "sentry", name: "Sentry", category: "Infra", icon: "sentry", auth: apiKey, description: "Create Sentry issues.", template: "ticket" },
  { id: "cloudflare", name: "Cloudflare", category: "Infra", icon: "cloudflare", auth: apiKey, description: "Manage Cloudflare DNS and KV.", template: "deploy" },
  { id: "vercel", name: "Vercel", category: "Infra", icon: "vercel", auth: apiKey, description: "Create Vercel deployments.", template: "deploy" },
  { id: "netlify", name: "Netlify", category: "Infra", icon: "netlify", auth: oauth("netlify"), description: "Create Netlify deploys.", template: "deploy" },
  { id: "heroku", name: "Heroku", category: "Infra", icon: "heroku", auth: apiKey, description: "Scale and deploy Heroku apps.", template: "deploy" },
  { id: "digitalocean", name: "DigitalOcean", category: "Infra", icon: "digitalocean", auth: apiKey, description: "Create DigitalOcean droplets.", template: "deploy" },
  { id: "figma", name: "Figma", category: "Design", icon: "figma", auth: oauth("figma"), description: "Comment on Figma files.", template: "file" },
  { id: "canva", name: "Canva", category: "Design", icon: "canva", auth: oauth("canva"), description: "Create Canva designs.", template: "file" },
  { id: "miro", name: "Miro", category: "Design", icon: "miro", auth: oauth("miro"), description: "Create Miro board items.", template: "file" },
  { id: "webflow", name: "Webflow", category: "Design", icon: "webflow", auth: oauth("webflow"), description: "Create Webflow CMS items.", template: "sheet" },
  { id: "contentful", name: "Contentful", category: "Design", icon: "contentful", auth: apiKey, description: "Create Contentful entries.", template: "sheet" },
  { id: "sanity", name: "Sanity", category: "Design", icon: "sanity", auth: apiKey, description: "Create Sanity documents.", template: "sheet" },
  { id: "strapi", name: "Strapi", category: "Design", icon: "strapi", auth: apiKey, description: "Create Strapi entries.", template: "sheet" },
  { id: "wordpress", name: "WordPress", category: "Design", icon: "wordpress", auth: jwt, description: "Create WordPress posts.", template: "file" },
  { id: "ghost", name: "Ghost", category: "Design", icon: "ghost", auth: apiKey, description: "Create Ghost posts.", template: "file" },
  { id: "spotify", name: "Spotify", category: "Social", icon: "spotify", auth: oauth("spotify"), description: "Create Spotify playlists.", template: "file" },
  { id: "1password", name: "1Password", category: "Auth", icon: "1password", auth: jwt, description: "Create 1Password items.", template: "identity" },
  { id: "okta", name: "Okta", category: "Auth", icon: "okta", auth: oauth("okta"), description: "Create Okta users.", template: "identity" },
  { id: "auth0", name: "Auth0", category: "Auth", icon: "auth0", auth: oauth("auth0"), description: "Create Auth0 users.", template: "identity" },
  { id: "clerk", name: "Clerk", category: "Auth", icon: "clerk", auth: apiKey, description: "Create Clerk users.", template: "identity" },
  { id: "quickbooks", name: "QuickBooks", category: "Finance", icon: "quickbooks", auth: oauth("quickbooks"), description: "Create QuickBooks invoices.", template: "payment" },
  { id: "xero", name: "Xero", category: "Finance", icon: "xero", auth: oauth("xero"), description: "Create Xero invoices.", template: "payment" },
  { id: "plaid", name: "Plaid", category: "Finance", icon: "plaid", auth: apiKey, description: "Create Plaid link items.", template: "identity" },
  { id: "circleci", name: "CircleCI", category: "Developer", icon: "circleci", auth: apiKey, description: "Trigger CircleCI pipelines.", template: "deploy" },
  { id: "jenkins", name: "Jenkins", category: "Developer", icon: "jenkins", auth: basic, description: "Trigger Jenkins jobs.", template: "deploy" },
  { id: "algolia", name: "Algolia", category: "Analytics", icon: "algolia", auth: apiKey, description: "Upsert Algolia records.", template: "search" },
  { id: "databricks", name: "Databricks", category: "Databases", icon: "databricks", auth: apiKey, description: "Run Databricks SQL.", template: "db" },
  { id: "airbyte", name: "Airbyte", category: "Infra", icon: "airbyte", auth: apiKey, description: "Trigger Airbyte syncs.", template: "deploy" },
]

export const CONNECTORS: Connector[] = defs.map((def) => {
  const sheets = templates[def.template]
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    category: def.category,
    iconSlug: def.icon,
    auth: def.auth,
    inFields: sheets.in,
    dataFields: sheets.data,
    outFields: sheets.out,
  }
})

export function getConnector(id: string): Connector | undefined {
  return CONNECTORS.find((connector) => connector.id === id)
}

export function listConnectorCategories(): ConnectorCategory[] {
  return [...new Set(CONNECTORS.map((connector) => connector.category))]
}
