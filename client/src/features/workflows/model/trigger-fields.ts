import type { NodeField } from "./types"
import { httpMethodField } from "./http-fields"
import { HOUR_OPTIONS, INTERVAL_TYPES, WEEKDAYS } from "./schedule"

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York (Eastern)" },
  { value: "America/Chicago", label: "America/Chicago (Central)" },
  { value: "America/Denver", label: "America/Denver (Mountain)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific)" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland" },
] as const

const POLL_INTERVALS = [
  { value: "1m", label: "Every minute" },
  { value: "5m", label: "Every 5 minutes" },
  { value: "15m", label: "Every 15 minutes" },
  { value: "30m", label: "Every 30 minutes" },
  { value: "1h", label: "Every hour" },
  { value: "6h", label: "Every 6 hours" },
  { value: "12h", label: "Every 12 hours" },
  { value: "1d", label: "Every day" },
] as const

export function scheduleCronField(placeholder = "0 9 * * 1-5"): NodeField {
  return {
    key: "cron",
    label: "Cron expression",
    placeholder,
    control: "cron",
    section: "parameters",
    mode: "fixed",
    showWhen: { key: "intervalType", equals: "cron" },
    validation: [{ kind: "cron" }],
    help: "Standard 5-field cron (minute hour day-of-month month day-of-week).",
  }
}

export function scheduleTimezoneField(placeholder = "UTC"): NodeField {
  return {
    key: "timezone",
    label: "Timezone",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: COMMON_TIMEZONES.map((option) => ({ ...option })),
    help: "Timezone used when evaluating the schedule.",
  }
}

export function webhookPathField(placeholder = "/hooks/vanteg"): NodeField {
  return {
    key: "path",
    label: "Path",
    placeholder,
    section: "parameters",
    required: true,
    validation: [{ kind: "required" }, { kind: "uniqueWebhookPath" }, { kind: "regex", pattern: "^/" }],
    help: "URL path that receives the webhook request.",
  }
}

export function webhookSecretField(): NodeField {
  return {
    key: "secret",
    label: "Secret",
    placeholder: "Optional signing secret",
    secret: true,
    section: "connection",
    mode: "fixed",
    help: "Optional shared secret for verifying webhook requests. Leave blank if unused.",
  }
}

export function pollUrlField(
  placeholder = "https://api.example.com/status"
): NodeField {
  return {
    key: "url",
    label: "URL",
    placeholder,
    section: "parameters",
    mode: "either",
    required: true,
    validation: [{ kind: "url" }, { kind: "required" }],
    help: "HTTP endpoint to poll for changes.",
  }
}

export function pollIntervalField(placeholder = "5m"): NodeField {
  return {
    key: "interval",
    label: "Interval",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: POLL_INTERVALS.map((option) => ({ ...option })),
    help: "How often to check the URL.",
  }
}

export function rssFeedUrlField(
  placeholder = "https://example.com/feed"
): NodeField {
  return {
    key: "url",
    label: "Feed URL",
    placeholder,
    section: "parameters",
    mode: "either",
    required: true,
    validation: [{ kind: "url" }, { kind: "required" }],
    help: "RSS or Atom feed to watch for new items.",
  }
}

export function rssIntervalField(placeholder = "15m"): NodeField {
  return {
    key: "interval",
    label: "Interval",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: POLL_INTERVALS.map((option) => ({ ...option })),
    help: "How often to check the feed.",
  }
}

export function scheduleFields(): NodeField[] {
  return [
    {
      key: "intervalType",
      label: "Interval type",
      placeholder: "cron",
      control: "select",
      section: "parameters",
      mode: "fixed",
      options: INTERVAL_TYPES.map((option) => ({ ...option })),
    },
    {
      key: "intervalCount",
      label: "Interval count",
      placeholder: "1",
      control: "number",
      section: "parameters",
      defaultValue: "1",
      showWhen: { key: "intervalType", notEquals: "cron" },
      validation: [{ kind: "integer" }, { kind: "min", value: 1 }],
    },
    {
      key: "dayInterval",
      label: "Day interval",
      placeholder: "1",
      control: "number",
      section: "parameters",
      showWhen: { key: "intervalType", equals: "days" },
      validation: [{ kind: "integer" }, { kind: "min", value: 1 }, { kind: "max", value: 31 }],
    },
    {
      key: "weekdays",
      label: "Weekdays",
      placeholder: '["1"]',
      control: "multiselect",
      section: "parameters",
      showWhen: { key: "intervalType", equals: "weeks" },
      options: WEEKDAYS.map((option) => ({ ...option })),
    },
    {
      key: "monthDay",
      label: "Day of month",
      placeholder: "1",
      control: "number",
      section: "parameters",
      showWhen: { key: "intervalType", equals: "months" },
      validation: [{ kind: "integer" }, { kind: "min", value: 1 }, { kind: "max", value: 31 }],
    },
    {
      key: "hour",
      label: "Hour",
      placeholder: "9",
      control: "select",
      section: "parameters",
      mode: "fixed",
      showWhen: { key: "intervalType", equals: ["days", "weeks", "months"] },
      options: HOUR_OPTIONS.map((option) => ({ ...option })),
    },
    {
      key: "minute",
      label: "Minute",
      placeholder: "0",
      control: "number",
      section: "parameters",
      showWhen: { key: "intervalType", equals: ["days", "weeks", "months", "hours"] },
      validation: [{ kind: "integer" }, { kind: "min", value: 0 }, { kind: "max", value: 59 }],
    },
    scheduleTimezoneField(),
    {
      key: "startAt",
      label: "Start",
      placeholder: "",
      control: "datetime",
      section: "options",
      help: "Optional. Do not run before this time.",
    },
    {
      key: "endAt",
      label: "End",
      placeholder: "",
      control: "datetime",
      section: "options",
      validation: [{ kind: "dateOrder", beforeKey: "startAt", afterKey: "endAt" }],
      help: "Optional. Do not run after this time.",
    },
    scheduleCronField(),
  ]
}

export function webhookFields(): NodeField[] {
  return [
    webhookPathField(),
    httpMethodField("POST"),
    webhookSecretField(),
    {
      key: "respondMode",
      label: "Respond",
      placeholder: "immediately",
      control: "select",
      section: "options",
      mode: "fixed",
      options: [
        { value: "immediately", label: "Immediately" },
        { value: "lastNode", label: "When last node finishes" },
        { value: "streaming", label: "Streaming" },
      ],
    },
    {
      key: "cors",
      label: "CORS",
      placeholder: "false",
      control: "boolean",
      section: "options",
      mode: "fixed",
    },
    {
      key: "binaryField",
      label: "Binary field name",
      placeholder: "data",
      section: "options",
      mode: "either",
    },
    {
      key: "ignoreBots",
      label: "Ignore bots",
      placeholder: "false",
      control: "boolean",
      section: "options",
      mode: "fixed",
    },
    {
      key: "ipAllowlist",
      label: "IP allowlist",
      placeholder: "10.0.0.1",
      section: "options",
      mode: "either",
      help: "Optional comma-separated IP allowlist.",
    },
    {
      key: "noResponseBody",
      label: "No response body",
      placeholder: "false",
      control: "boolean",
      section: "options",
      mode: "fixed",
    },
    {
      key: "includeRawBody",
      label: "Raw body",
      placeholder: "false",
      control: "boolean",
      section: "options",
      mode: "fixed",
    },
    {
      key: "responseCode",
      label: "Response code",
      placeholder: "200",
      control: "number",
      section: "options",
      showWhen: { key: "respondMode", equals: "immediately" },
      validation: [{ kind: "integer" }, { kind: "min", value: 100 }, { kind: "max", value: 599 }],
    },
    {
      key: "responseData",
      label: "Response data",
      placeholder: '{ "ok": true }',
      control: "textarea",
      section: "options",
      mode: "either",
      showWhen: { key: "noResponseBody", equals: "false" },
    },
    {
      key: "responseHeaders",
      label: "Response headers",
      placeholder: "{}",
      control: "keyValue",
      section: "options",
      mode: "either",
    },
    {
      key: "contentType",
      label: "Content type",
      placeholder: "application/json",
      section: "options",
      mode: "either",
    },
    {
      key: "bodyLimit",
      label: "Body limit (bytes)",
      placeholder: "1048576",
      control: "number",
      section: "options",
      validation: [{ kind: "integer" }, { kind: "min", value: 1 }],
    },
    {
      key: "pathParameters",
      label: "Path parameters",
      placeholder: "id",
      section: "options",
      mode: "either",
      help: "Optional named path parameters, comma-separated.",
    },
    {
      key: "signatureHeader",
      label: "Signature header",
      placeholder: "X-Signature",
      section: "connection",
      mode: "fixed",
    },
  ]
}

export function pollUrlFields(): NodeField[] {
  return [pollUrlField(), pollIntervalField()]
}

export function rssFields(): NodeField[] {
  return [
    rssFeedUrlField(),
    rssIntervalField(),
    {
      key: "auth",
      label: "Auth header",
      placeholder: "Optional",
      section: "connection",
      mode: "either",
      secret: true,
      help: "Optional Authorization header when the feed is private.",
    },
    {
      key: "dedupeField",
      label: "Dedupe field",
      placeholder: "guid",
      section: "options",
      mode: "fixed",
    },
    {
      key: "fullContent",
      label: "Fetch full content",
      placeholder: "false",
      control: "boolean",
      section: "options",
      mode: "fixed",
    },
    {
      key: "maxAge",
      label: "Ignore items older than",
      placeholder: "7d",
      section: "options",
      mode: "fixed",
    },
  ]
}
