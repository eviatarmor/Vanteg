import {
  contracts,
  io,
  ioArray,
  ioObject,
  type IoSchemaField,
} from "@workspace/integrations"

export {
  io,
  ioArray,
  ioObject,
} from "@workspace/integrations"

const ok = io("ok", "Ok", "boolean", {
  description: "Whether the operation succeeded.",
})

export const preservedItem: IoSchemaField = io("item", "Item", "object", {
  description: "Data from the previous step, preserved.",
})

export const manualOutputs: IoSchemaField[] = [
  io("payload", "Payload", "object", { optional: true }),
  io("triggeredAt", "Triggered at", "datetime"),
  io("triggeredBy", "Triggered by", "string", { optional: true }),
  io("runId", "Run ID", "string"),
]

export const scheduleOutputs: IoSchemaField[] = [
  io("triggeredAt", "Triggered at", "datetime"),
  io("scheduledFor", "Scheduled for", "datetime"),
  io("timezone", "Timezone", "string"),
  io("previousRunAt", "Previous run at", "datetime", { optional: true }),
  io("nextRunAt", "Next run at", "datetime", { optional: true }),
  ioObject("schedule", "Schedule", [
    io("intervalType", "Interval type", "string"),
    io("cron", "Cron", "string", { optional: true }),
    io("summary", "Summary", "string"),
  ]),
]

export const webhookOutputs: IoSchemaField[] = [
  io("body", "Body", "any", { optional: true }),
  io("rawBody", "Raw body", "string", { optional: true }),
  ioObject("headers", "Headers", []),
  ioObject("query", "Query", []),
  ioObject("pathParams", "Path params", []),
  io("method", "Method", "string"),
  io("path", "Path", "string"),
  io("ip", "IP", "string", { optional: true }),
  io("userAgent", "User agent", "string", { optional: true }),
  io("binary", "Binary", "binary", { optional: true }),
  io("requestId", "Request ID", "string"),
  io("receivedAt", "Received at", "datetime"),
]

export const emailInboundOutputs = contracts.emailMessageOutputs("inbound")
export const emailOutboundOutputs = contracts.emailMessageOutputs("outbound")

export const formTriggerOutputs = contracts.formSubmissionOutputs

export const appEventOutputs: IoSchemaField[] = [
  io("app", "App", "string"),
  io("event", "Event", "string"),
  io("eventId", "Event ID", "string"),
  ioObject("data", "Data", []),
  io("receivedAt", "Received at", "datetime"),
]

export const rssOutputs: IoSchemaField[] = [
  ioObject("feed", "Feed", [
    io("title", "Title", "string", { optional: true }),
    io("url", "URL", "string"),
    io("description", "Description", "string", { optional: true }),
  ]),
  io("itemId", "Item ID", "string"),
  io("title", "Title", "string"),
  io("url", "URL", "string", { optional: true }),
  io("content", "Content", "string", { optional: true }),
  io("summary", "Summary", "string", { optional: true }),
  io("author", "Author", "string", { optional: true }),
  io("publishedAt", "Published at", "datetime", { optional: true }),
  ioArray(
    "enclosures",
    "Enclosures",
    ioObject("file", "File", [
      io("url", "URL", "string"),
      io("type", "Type", "string", { optional: true }),
    ]),
    { optional: true }
  ),
]

export const callOutputs: IoSchemaField[] = [
  io("callId", "Call ID", "string"),
  io("from", "From", "string"),
  io("to", "To", "string"),
  io("direction", "Direction", "string"),
  io("status", "Status", "string"),
  io("startedAt", "Started at", "datetime", { optional: true }),
  io("endedAt", "Ended at", "datetime", { optional: true }),
  io("duration", "Duration (s)", "number", { optional: true }),
  io("recordingUrl", "Recording URL", "string", { optional: true }),
  io("transcript", "Transcript", "string", { optional: true }),
]

export const pollUrlOutputs: IoSchemaField[] = [
  ...contracts.httpResponseOutputs,
  io("previousValue", "Previous value", "any", { optional: true }),
  io("currentValue", "Current value", "any", { optional: true }),
  ioArray("changedPaths", "Changed paths", io("path", "Path", "string"), { optional: true }),
  io("detectedAt", "Detected at", "datetime"),
]

export const databaseRowOutputs: IoSchemaField[] = [
  io("table", "Table", "string"),
  ioObject("row", "Row", []),
  ioObject("before", "Before", [], { optional: true }),
  ioObject("after", "After", [], { optional: true }),
  io("id", "ID", "string", { optional: true }),
  io("occurredAt", "Occurred at", "datetime"),
]

export const databaseQueryOutputs: IoSchemaField[] = [
  ioArray("rows", "Rows", ioObject("row", "Row", [])),
  ioObject("record", "Record", [], { optional: true }),
  io("affectedCount", "Affected count", "integer"),
  ioArray("ids", "IDs", io("id", "ID", "string"), { optional: true }),
  ok,
]

export const aiChatOutputs: IoSchemaField[] = [
  io("channel", "Channel", "string", { optional: true }),
  io("messageId", "Message ID", "string"),
  io("role", "Role", "string"),
  io("content", "Content", "string"),
  io("receivedAt", "Received at", "datetime"),
]

export const aiGenerationOutputs: IoSchemaField[] = [
  io("model", "Model", "string"),
  io("provider", "Provider", "string", { optional: true }),
  io("content", "Content", "string", { optional: true }),
  io("result", "Result", "any", { optional: true }),
  ioObject("usage", "Usage", [
    io("inputTokens", "Input tokens", "integer", { optional: true }),
    io("outputTokens", "Output tokens", "integer", { optional: true }),
  ]),
  io("finishReason", "Finish reason", "string", { optional: true }),
  io("error", "Error", "string", { optional: true }),
  ok,
]

export const aiClassifyOutputs: IoSchemaField[] = [
  ...aiGenerationOutputs,
  io("label", "Label", "string"),
  ioArray("labels", "Labels", io("name", "Name", "string"), { optional: true }),
  io("confidence", "Confidence", "number"),
  io("fallbackUsed", "Fallback used", "boolean", { optional: true }),
]

export const aiExtractOutputs: IoSchemaField[] = [
  ...aiGenerationOutputs,
  ioObject("data", "Data", []),
  io("valid", "Valid", "boolean"),
  ioArray("errors", "Errors", io("message", "Message", "string"), { optional: true }),
]

export const fileEventOutputs: IoSchemaField[] = [
  io("path", "Path", "string"),
  io("name", "Name", "string"),
  io("operation", "Operation", "string"),
  io("mimeType", "MIME type", "string", { optional: true }),
  io("size", "Size", "integer", { optional: true }),
  io("occurredAt", "Occurred at", "datetime"),
]

export const fileReadOutputs: IoSchemaField[] = [
  io("path", "Path", "string"),
  io("content", "Content", "string", { optional: true }),
  io("binary", "Binary", "binary", { optional: true }),
  io("encoding", "Encoding", "string", { optional: true }),
  io("mimeType", "MIME type", "string", { optional: true }),
  io("size", "Size", "integer", { optional: true }),
  ok,
]

export const fileWriteOutputs: IoSchemaField[] = [
  io("path", "Path", "string"),
  io("bytesWritten", "Bytes written", "integer", { optional: true }),
  ok,
]

export const fileListOutputs: IoSchemaField[] = [
  io("path", "Path", "string"),
  ioArray("entries", "Entries", io("name", "Name", "string")),
  io("count", "Count", "integer"),
  ok,
]

export const notificationEventOutputs: IoSchemaField[] = [
  io("notificationId", "Notification ID", "string"),
  io("channel", "Channel", "string", { optional: true }),
  io("title", "Title", "string"),
  io("message", "Message", "string", { optional: true }),
  io("clicked", "Clicked", "boolean", { optional: true }),
  io("receivedAt", "Received at", "datetime"),
]

export const notificationActionOutputs: IoSchemaField[] = [
  io("notificationId", "Notification ID", "string"),
  io("channel", "Channel", "string", { optional: true }),
  io("audience", "Audience", "string", { optional: true }),
  io("deliveredAt", "Delivered at", "datetime"),
  io("status", "Status", "string"),
  ok,
]

export const httpRequestOutputs = contracts.httpResponseOutputs

export const downloadFileOutputs: IoSchemaField[] = [
  io("binary", "Binary", "binary"),
  io("filename", "Filename", "string"),
  io("mimeType", "MIME type", "string"),
  io("size", "Size", "integer"),
  io("path", "Saved path", "string", { optional: true }),
  ok,
]

export const respondWebhookOutputs: IoSchemaField[] = [
  io("status", "Status", "integer"),
  io("sentAt", "Sent at", "datetime"),
  ok,
]

export const ifOutputs: IoSchemaField[] = [
  preservedItem,
  io("matched", "Matched", "boolean"),
  io("branch", "Branch", "string"),
]

export const filterOutputs: IoSchemaField[] = [
  preservedItem,
  io("matched", "Matched", "boolean"),
  io("index", "Index", "integer", { optional: true }),
]

export const switchOutputs: IoSchemaField[] = [
  preservedItem,
  io("matchedRoute", "Matched route", "string"),
  io("routeId", "Route ID", "string"),
]

export const delayOutputs: IoSchemaField[] = [
  preservedItem,
  io("delayedMs", "Delayed (ms)", "integer"),
  io("resumedAt", "Resumed at", "datetime"),
  io("mode", "Mode", "string"),
]

export const codeOutputs: IoSchemaField[] = [
  io("result", "Result", "any"),
  ioObject("console", "Console", [
    ioArray("logs", "Logs", io("line", "Line", "string"), { optional: true }),
  ]),
  ok,
]

export const mappingOutputs: IoSchemaField[] = [
  ioObject("data", "Data", []),
  ok,
]

export const mergeOutputs: IoSchemaField[] = [
  ioArray("items", "Items", ioObject("item", "Item", [])),
  io("count", "Count", "integer"),
  io("mode", "Mode", "string"),
  ok,
]

export const loopEachOutputs: IoSchemaField[] = [
  io("item", "Item", "any"),
  io("index", "Index", "integer"),
  io("batch", "Batch", "integer", { optional: true }),
  io("isFirst", "Is first", "boolean"),
  io("isLast", "Is last", "boolean"),
]

export const loopDoneOutputs: IoSchemaField[] = [
  ioArray("results", "Results", io("item", "Item", "any")),
  io("count", "Count", "integer"),
  io("failures", "Failures", "integer"),
  ok,
]

export const formatterOutputs: IoSchemaField[] = [
  io("value", "Value", "any"),
  io("type", "Type", "string"),
  io("operation", "Operation", "string"),
]

export const ACTION_EXECUTION = [
  "onlyRunIf",
  "retry",
  "attempts",
  "retryDelay",
  "backoff",
  "timeout",
  "continueOnFail",
  "alwaysOutputData",
  "errorOutput",
] as const

export const HTTP_EXECUTION = [
  ...ACTION_EXECUTION,
  "itemMode",
  "rawResponse",
  "pagination",
  "returnAll",
  "maxItems",
] as const

export const LOGIC_EXECUTION = ["onlyRunIf", "continueOnFail", "alwaysOutputData"] as const
