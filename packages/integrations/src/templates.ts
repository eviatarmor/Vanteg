import type { FieldVariant, SheetField, TemplateName } from "./types.ts"

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

export const templates: Record<TemplateName, { in: SheetField[]; data: SheetField[]; out: SheetField[] }> = {
  sheet: {
    in: [
      field("spreadsheetId", "Spreadsheet ID", "short-text", {
        required: true,
        defaultValue: "1vanteg-demo-sheet",
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
