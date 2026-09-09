import type { NodeField } from "./types"

const NOTIFICATION_SEVERITIES = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
] as const

const FILE_OPERATIONS = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "list", label: "List" },
  { value: "delete", label: "Delete" },
] as const

const WEBHOOK_STATUSES = [
  { value: "200", label: "200 OK" },
  { value: "201", label: "201 Created" },
  { value: "204", label: "204 No Content" },
  { value: "400", label: "400 Bad Request" },
  { value: "401", label: "401 Unauthorized" },
  { value: "403", label: "403 Forbidden" },
  { value: "404", label: "404 Not Found" },
  { value: "500", label: "500 Internal Server Error" },
] as const

export function notificationChannelField(placeholder = "ops"): NodeField {
  return {
    key: "channel",
    label: "Channel",
    placeholder,
    help: "Destination channel or audience for the notification.",
  }
}

export function notificationTitleField(placeholder = "Done"): NodeField {
  return {
    key: "title",
    label: "Title",
    placeholder,
  }
}

export function notificationMessageField(
  placeholder = "Workflow finished successfully."
): NodeField {
  return {
    key: "message",
    label: "Message",
    placeholder,
    control: "textarea",
    help: "Body shown in the push or in-app notification.",
  }
}

export function notificationSeverityField(placeholder = "info"): NodeField {
  return {
    key: "severity",
    label: "Severity",
    placeholder,
    control: "select",
    options: NOTIFICATION_SEVERITIES.map((option) => ({ ...option })),
  }
}

export function filePathField(placeholder = "/tmp/export.csv"): NodeField {
  return {
    key: "path",
    label: "Path",
    placeholder,
    help: "File or directory path to operate on.",
  }
}

export function fileOperationField(placeholder = "read"): NodeField {
  return {
    key: "operation",
    label: "Operation",
    placeholder,
    control: "select",
    options: FILE_OPERATIONS.map((option) => ({ ...option })),
  }
}

export function fileContentField(placeholder = "id,name\n1,Ada"): NodeField {
  return {
    key: "content",
    label: "Content",
    placeholder,
    control: "textarea",
    help: "File contents used when Operation is write. Ignored for read, list, and delete.",
  }
}

export function respondWebhookStatusField(placeholder = "200"): NodeField {
  return {
    key: "status",
    label: "Status",
    placeholder,
    control: "select",
    options: WEBHOOK_STATUSES.map((option) => ({ ...option })),
    help: "HTTP status code returned to the webhook caller.",
  }
}

export function respondWebhookBodyField(
  placeholder = '{ "ok": true }'
): NodeField {
  return {
    key: "body",
    label: "Body",
    placeholder,
    control: "textarea",
    help: "Response body returned to the caller.",
  }
}

export function respondWebhookHeadersField(
  placeholder = '{\n  "Content-Type": "application/json"\n}'
): NodeField {
  return {
    key: "headers",
    label: "Headers",
    placeholder,
    control: "code",
    language: "json",
    help: "Optional response headers as a JSON object. Leave blank to omit.",
  }
}
