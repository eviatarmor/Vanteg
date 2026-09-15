import { io, ioArray, ioObject, type IoSchemaField } from "./io-schema.ts"

const ok = io("ok", "Ok", "boolean", {
  description: "Whether the operation succeeded.",
})

function addressFields(): IoSchemaField[] {
  return [
    io("email", "Email", "string"),
    io("name", "Name", "string", { optional: true }),
  ]
}

export const httpResponseOutputs: IoSchemaField[] = [
  io("status", "Status", "integer"),
  io("statusText", "Status text", "string"),
  ioObject("headers", "Headers", [io("contentType", "Content-Type", "string", { optional: true })]),
  io("body", "Body", "any", { optional: true }),
  io("rawBody", "Raw body", "string", { optional: true }),
  io("binary", "Binary", "binary", { optional: true }),
  io("duration", "Duration (ms)", "number"),
  io("finalUrl", "Final URL", "string"),
  ok,
]

export const chatMessageOutputs: IoSchemaField[] = [
  io("messageId", "Message ID", "string"),
  io("channel", "Channel", "string"),
  io("channelId", "Channel ID", "string", { optional: true }),
  io("user", "User", "string", { optional: true }),
  io("userId", "User ID", "string", { optional: true }),
  io("text", "Text", "string"),
  io("ts", "Timestamp", "string"),
  io("threadTs", "Thread timestamp", "string", { optional: true }),
  io("teamId", "Team ID", "string", { optional: true }),
  io("receivedAt", "Received at", "datetime"),
]

export const chatMessageActionOutputs: IoSchemaField[] = [
  ok,
  io("ts", "Timestamp", "string"),
  io("channel", "Channel", "string"),
  io("channelId", "Channel ID", "string", { optional: true }),
  io("messageId", "Message ID", "string"),
  io("threadTs", "Thread timestamp", "string", { optional: true }),
  io("text", "Text", "string", { optional: true }),
  io("permalink", "Permalink", "string", { optional: true }),
]

export const chatReactionOutputs: IoSchemaField[] = [
  io("channel", "Channel", "string"),
  io("user", "User", "string", { optional: true }),
  io("userId", "User ID", "string", { optional: true }),
  io("emoji", "Emoji", "string"),
  io("ts", "Message timestamp", "string"),
  io("itemUser", "Item user", "string", { optional: true }),
  io("receivedAt", "Received at", "datetime"),
]

export const chatChannelOutputs: IoSchemaField[] = [
  io("channelId", "Channel ID", "string"),
  io("name", "Name", "string"),
  io("isPrivate", "Private", "boolean", { optional: true }),
  io("teamId", "Team ID", "string", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  ok,
]

export const chatChannelListOutputs: IoSchemaField[] = [
  ioArray(
    "channels",
    "Channels",
    ioObject(
      "channel",
      "Channel",
      chatChannelOutputs.filter((field) => field.key !== "ok")
    )
  ),
  io("count", "Count", "integer"),
  ok,
]

export const chatUserOutputs: IoSchemaField[] = [
  io("userId", "User ID", "string"),
  io("user", "User", "string"),
  io("email", "Email", "string", { optional: true }),
  io("teamId", "Team ID", "string", { optional: true }),
  io("joinedAt", "Joined at", "datetime", { optional: true }),
]

export const chatFileOutputs: IoSchemaField[] = [
  ok,
  io("fileId", "File ID", "string"),
  io("name", "Name", "string"),
  io("mimetype", "MIME type", "string", { optional: true }),
  io("size", "Size", "integer", { optional: true }),
  io("url", "URL", "string", { optional: true }),
  io("permalink", "Permalink", "string", { optional: true }),
  io("channel", "Channel", "string", { optional: true }),
]

export const chatReactionActionOutputs: IoSchemaField[] = [
  ok,
  io("channel", "Channel", "string"),
  io("ts", "Message timestamp", "string"),
  io("emoji", "Emoji", "string"),
]

export const teamsMessageOutputs: IoSchemaField[] = [
  io("messageId", "Message ID", "string"),
  io("teamId", "Team ID", "string"),
  io("channelId", "Channel ID", "string"),
  io("channel", "Channel", "string", { optional: true }),
  io("userId", "User ID", "string", { optional: true }),
  io("user", "User", "string", { optional: true }),
  io("text", "Text", "string"),
  io("threadId", "Thread ID", "string", { optional: true }),
  io("receivedAt", "Received at", "datetime"),
]

export const sheetRowOutputs: IoSchemaField[] = [
  ioObject("row", "Row", [io("values", "Values", "any")]),
  io("rowNumber", "Row number", "integer"),
  io("range", "Range", "string"),
  io("spreadsheetId", "Spreadsheet ID", "string", { optional: true }),
  io("sheet", "Sheet", "string", { optional: true }),
  io("affectedCount", "Affected count", "integer"),
  ok,
]

export const driveFileOutputs: IoSchemaField[] = [
  io("id", "ID", "string"),
  io("name", "Name", "string"),
  io("mimeType", "MIME type", "string", { optional: true }),
  io("url", "URL", "string", { optional: true }),
  io("webViewLink", "Web view link", "string", { optional: true }),
  ioObject("metadata", "Metadata", [
    io("size", "Size", "integer", { optional: true }),
    io("parents", "Parents", "array", { optional: true }),
  ]),
  ok,
]

export const githubIssueOutputs: IoSchemaField[] = [
  io("id", "ID", "string"),
  io("number", "Number", "integer"),
  io("title", "Title", "string"),
  io("body", "Body", "string", { optional: true }),
  io("state", "State", "string"),
  io("url", "URL", "string"),
  io("htmlUrl", "HTML URL", "string", { optional: true }),
  io("user", "User", "string", { optional: true }),
  ioArray("labels", "Labels", io("name", "Name", "string"), { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  io("updatedAt", "Updated at", "datetime", { optional: true }),
  io("closedAt", "Closed at", "datetime", { optional: true }),
  ok,
]

export const githubCommentOutputs: IoSchemaField[] = [
  io("id", "ID", "string"),
  io("body", "Body", "string"),
  io("user", "User", "string", { optional: true }),
  io("url", "URL", "string"),
  io("htmlUrl", "HTML URL", "string", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  ok,
]

export const githubPullRequestOutputs: IoSchemaField[] = [
  io("id", "ID", "string"),
  io("number", "Number", "integer"),
  io("title", "Title", "string"),
  io("body", "Body", "string", { optional: true }),
  io("state", "State", "string"),
  io("merged", "Merged", "boolean"),
  io("draft", "Draft", "boolean", { optional: true }),
  io("head", "Head branch", "string"),
  io("base", "Base branch", "string"),
  io("url", "URL", "string"),
  io("htmlUrl", "HTML URL", "string", { optional: true }),
  io("mergedAt", "Merged at", "datetime", { optional: true }),
  ok,
]

export const githubCommitOutputs: IoSchemaField[] = [
  io("sha", "SHA", "string"),
  io("message", "Message", "string"),
  io("author", "Author", "string", { optional: true }),
  io("url", "URL", "string"),
  io("htmlUrl", "HTML URL", "string", { optional: true }),
  io("branch", "Branch", "string", { optional: true }),
  io("committedAt", "Committed at", "datetime", { optional: true }),
]

export const githubReleaseOutputs: IoSchemaField[] = [
  io("id", "ID", "string"),
  io("tag", "Tag", "string"),
  io("name", "Name", "string"),
  io("body", "Body", "string", { optional: true }),
  io("draft", "Draft", "boolean", { optional: true }),
  io("prerelease", "Prerelease", "boolean", { optional: true }),
  io("url", "URL", "string"),
  io("htmlUrl", "HTML URL", "string", { optional: true }),
  io("publishedAt", "Published at", "datetime", { optional: true }),
  ok,
]

export const githubMergeOutputs: IoSchemaField[] = [
  io("sha", "SHA", "string"),
  io("merged", "Merged", "boolean"),
  io("message", "Message", "string", { optional: true }),
  ok,
]

export const notionPageOutputs: IoSchemaField[] = [
  io("id", "Page ID", "string"),
  io("url", "URL", "string", { optional: true }),
  io("title", "Title", "string", { optional: true }),
  ioObject("properties", "Properties", []),
  io("parentId", "Parent ID", "string", { optional: true }),
  io("archived", "Archived", "boolean", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  io("updatedAt", "Updated at", "datetime", { optional: true }),
  ok,
]

export const airtableRecordOutputs: IoSchemaField[] = [
  io("id", "Record ID", "string"),
  io("createdTime", "Created time", "datetime", { optional: true }),
  ioObject("fields", "Fields", []),
  io("table", "Table", "string", { optional: true }),
  io("base", "Base", "string", { optional: true }),
  ok,
]

export const airtableRecordListOutputs: IoSchemaField[] = [
  ioArray(
    "records",
    "Records",
    ioObject(
      "record",
      "Record",
      airtableRecordOutputs.filter((field) => field.key !== "ok")
    )
  ),
  io("count", "Count", "integer"),
  ok,
]

export const crmContactOutputs: IoSchemaField[] = [
  io("id", "Contact ID", "string"),
  io("email", "Email", "string", { optional: true }),
  io("name", "Name", "string", { optional: true }),
  io("firstName", "First name", "string", { optional: true }),
  io("lastName", "Last name", "string", { optional: true }),
  io("company", "Company", "string", { optional: true }),
  io("status", "Status", "string", { optional: true }),
  io("url", "URL", "string", { optional: true }),
  io("updatedAt", "Updated at", "datetime", { optional: true }),
  ok,
]

export const crmCompanyOutputs: IoSchemaField[] = [
  io("id", "Company ID", "string"),
  io("name", "Name", "string"),
  io("domain", "Domain", "string", { optional: true }),
  io("url", "URL", "string", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  ok,
]

export const crmDealOutputs: IoSchemaField[] = [
  io("id", "Deal ID", "string"),
  io("name", "Name", "string"),
  io("amount", "Amount", "number", { optional: true }),
  io("currency", "Currency", "string", { optional: true }),
  io("pipeline", "Pipeline", "string", { optional: true }),
  io("stage", "Stage", "string", { optional: true }),
  io("url", "URL", "string", { optional: true }),
  io("updatedAt", "Updated at", "datetime", { optional: true }),
  ok,
]

export const paymentChargeOutputs: IoSchemaField[] = [
  io("id", "Charge ID", "string"),
  io("amount", "Amount", "number"),
  io("currency", "Currency", "string"),
  io("status", "Status", "string"),
  io("customerId", "Customer ID", "string", { optional: true }),
  io("receiptUrl", "Receipt URL", "string", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  ok,
]

export const paymentCustomerOutputs: IoSchemaField[] = [
  io("id", "Customer ID", "string"),
  io("email", "Email", "string", { optional: true }),
  io("name", "Name", "string", { optional: true }),
  ok,
]

export const paymentSubscriptionOutputs: IoSchemaField[] = [
  io("id", "Subscription ID", "string"),
  io("status", "Status", "string"),
  io("plan", "Plan", "string", { optional: true }),
  io("customerId", "Customer ID", "string", { optional: true }),
  io("canceledAt", "Canceled at", "datetime", { optional: true }),
  ok,
]

export const paymentInvoiceOutputs: IoSchemaField[] = [
  io("id", "Invoice ID", "string"),
  io("amount", "Amount", "number"),
  io("currency", "Currency", "string", { optional: true }),
  io("status", "Status", "string"),
  io("customerId", "Customer ID", "string", { optional: true }),
  io("hostedUrl", "Hosted URL", "string", { optional: true }),
  ok,
]

export const paymentRefundOutputs: IoSchemaField[] = [
  io("id", "Refund ID", "string"),
  io("chargeId", "Charge ID", "string"),
  io("amount", "Amount", "number"),
  io("currency", "Currency", "string", { optional: true }),
  io("status", "Status", "string"),
  ok,
]

export const calendarEventOutputs: IoSchemaField[] = [
  io("eventId", "Event ID", "string"),
  io("calendarId", "Calendar ID", "string", { optional: true }),
  io("title", "Title", "string"),
  io("start", "Start", "datetime"),
  io("end", "End", "datetime"),
  io("htmlLink", "Link", "string", { optional: true }),
  io("status", "Status", "string", { optional: true }),
  io("location", "Location", "string", { optional: true }),
  ioArray("attendees", "Attendees", io("email", "Email", "string"), { optional: true }),
  ok,
]

export const formSubmissionOutputs: IoSchemaField[] = [
  io("submissionId", "Submission ID", "string"),
  io("formId", "Form ID", "string"),
  ioObject("answers", "Answers", []),
  io("respondent", "Respondent", "string", { optional: true }),
  io("respondentEmail", "Respondent email", "string", { optional: true }),
  io("submittedAt", "Submitted at", "datetime"),
]

export const formDefinitionOutputs: IoSchemaField[] = [
  io("formId", "Form ID", "string"),
  io("title", "Title", "string"),
  ioArray("questions", "Questions", io("id", "ID", "string")),
  io("updatedAt", "Updated at", "datetime", { optional: true }),
  ok,
]

export const formListOutputs: IoSchemaField[] = [
  ioArray("responses", "Responses", ioObject("item", "Item", formSubmissionOutputs)),
  io("count", "Count", "integer"),
  ok,
]

export const ticketOutputs: IoSchemaField[] = [
  io("ticketId", "Ticket ID", "string"),
  io("subject", "Subject", "string"),
  io("status", "Status", "string"),
  io("priority", "Priority", "string", { optional: true }),
  io("assignee", "Assignee", "string", { optional: true }),
  io("requester", "Requester", "string", { optional: true }),
  io("url", "URL", "string", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  io("updatedAt", "Updated at", "datetime", { optional: true }),
  ok,
]

export const ticketReplyOutputs: IoSchemaField[] = [
  io("replyId", "Reply ID", "string"),
  io("ticketId", "Ticket ID", "string"),
  io("body", "Body", "string"),
  io("author", "Author", "string", { optional: true }),
  io("createdAt", "Created at", "datetime", { optional: true }),
  ok,
]

export function emailMessageOutputs(kind: "inbound" | "outbound" = "inbound"): IoSchemaField[] {
  const base: IoSchemaField[] = [
    io("messageId", "Message ID", "string"),
    io("threadId", "Thread ID", "string", { optional: true }),
    ioObject("from", "From", addressFields(), { optional: true }),
    ioArray("to", "To", ioObject("address", "Address", addressFields())),
    ioArray("cc", "Cc", ioObject("address", "Address", addressFields()), { optional: true }),
    io("subject", "Subject", "string"),
    io("text", "Text", "string", { optional: true }),
    io("html", "HTML", "string", { optional: true }),
    ioObject("headers", "Headers", []),
    ioArray(
      "attachments",
      "Attachments",
      ioObject("file", "File", [
        io("filename", "Filename", "string"),
        io("mimeType", "MIME type", "string", { optional: true }),
        io("size", "Size", "integer", { optional: true }),
      ]),
      { optional: true }
    ),
  ]
  if (kind === "inbound") {
    return [...base, io("receivedAt", "Received at", "datetime")]
  }
  return [
    ...base,
    io("sentAt", "Sent at", "datetime"),
    io("status", "Status", "string"),
    ok,
  ]
}

export const GENERIC_OK = [ok]
