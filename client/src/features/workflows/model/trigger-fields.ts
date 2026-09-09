import type { NodeField } from "./types"
import { httpMethodField } from "./http-fields"

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
    control: "textarea",
    help: "Standard 5-field cron (minute hour day-of-month month day-of-week).",
  }
}

export function scheduleTimezoneField(placeholder = "UTC"): NodeField {
  return {
    key: "timezone",
    label: "Timezone",
    placeholder,
    control: "select",
    options: COMMON_TIMEZONES.map((option) => ({ ...option })),
    help: "Timezone used when evaluating the cron expression.",
  }
}

export function webhookPathField(placeholder = "/hooks/vanteg"): NodeField {
  return {
    key: "path",
    label: "Path",
    placeholder,
    help: "URL path that receives the webhook request.",
  }
}

export function webhookSecretField(): NodeField {
  return {
    key: "secret",
    label: "Secret",
    placeholder: "Optional signing secret",
    secret: true,
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
    help: "HTTP endpoint to poll for changes.",
  }
}

export function pollIntervalField(placeholder = "5m"): NodeField {
  return {
    key: "interval",
    label: "Interval",
    placeholder,
    control: "select",
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
    help: "RSS or Atom feed to watch for new items.",
  }
}

export function rssIntervalField(placeholder = "15m"): NodeField {
  return {
    key: "interval",
    label: "Interval",
    placeholder,
    control: "select",
    options: POLL_INTERVALS.map((option) => ({ ...option })),
    help: "How often to check the feed.",
  }
}

export function scheduleFields(): NodeField[] {
  return [scheduleCronField(), scheduleTimezoneField()]
}

export function webhookFields(): NodeField[] {
  return [
    webhookPathField(),
    httpMethodField("POST"),
    webhookSecretField(),
  ]
}

export function pollUrlFields(): NodeField[] {
  return [pollUrlField(), pollIntervalField()]
}

export function rssFields(): NodeField[] {
  return [rssFeedUrlField(), rssIntervalField()]
}
