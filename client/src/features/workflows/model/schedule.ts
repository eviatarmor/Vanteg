export const INTERVAL_TYPES = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "cron", label: "Custom Cron" },
] as const

export const WEEKDAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
] as const

export const HOUR_OPTIONS = [
  { value: "0", label: "Midnight" },
  { value: "1", label: "1 AM" },
  { value: "2", label: "2 AM" },
  { value: "3", label: "3 AM" },
  { value: "4", label: "4 AM" },
  { value: "5", label: "5 AM" },
  { value: "6", label: "6 AM" },
  { value: "7", label: "7 AM" },
  { value: "8", label: "8 AM" },
  { value: "9", label: "9 AM" },
  { value: "10", label: "10 AM" },
  { value: "11", label: "11 AM" },
  { value: "12", label: "Noon" },
  { value: "13", label: "1 PM" },
  { value: "14", label: "2 PM" },
  { value: "15", label: "3 PM" },
  { value: "16", label: "4 PM" },
  { value: "17", label: "5 PM" },
  { value: "18", label: "6 PM" },
  { value: "19", label: "7 PM" },
  { value: "20", label: "8 PM" },
  { value: "21", label: "9 PM" },
  { value: "22", label: "10 PM" },
  { value: "23", label: "11 PM" },
] as const

const CRON_FIELD = /^(\*|\d+(-\d+)?|\*\/\d+|\d+(,\d+)*)$/

export function isValidCron(value: string): boolean {
  const parts = value.trim().split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) {
    return false
  }
  return parts.every((part) => CRON_FIELD.test(part) || part === "?")
}

export function parseWeekdays(value: string | undefined): string[] {
  if (!value?.trim()) {
    return []
  }
  try {
    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(parsed)) {
      return parsed.map(String)
    }
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export function scheduleSummary(config: Record<string, string>): string {
  const type = config.intervalType || (config.cron ? "cron" : "minutes")
  const count = Number(config.intervalCount || "1")
  const timezone = config.timezone || "UTC"
  if (type === "cron") {
    const cron = config.cron?.trim() || "* * * * *"
    return `${cron} (${timezone})`
  }
  const unit = count === 1 ? type.replace(/s$/, "") : type
  if (type === "weeks") {
    const days = parseWeekdays(config.weekdays)
      .map((value) => WEEKDAYS.find((day) => day.value === value)?.label ?? value)
      .join(", ")
    return days
      ? `Every ${count} ${unit} on ${days} (${timezone})`
      : `Every ${count} ${unit} (${timezone})`
  }
  if (type === "months") {
    const day = config.monthDay || config.dayInterval || "1"
    return `Every ${count} ${unit} on day ${day} (${timezone})`
  }
  if (type === "days") {
    const hour = HOUR_OPTIONS.find((item) => item.value === (config.hour || "0"))?.label
    const minute = config.minute || "0"
    return `Every ${count} ${unit} at ${hour ?? "Midnight"}:${minute.padStart(2, "0")} (${timezone})`
  }
  return `Every ${count} ${unit} (${timezone})`
}

export function nextRunPreview(config: Record<string, string>, from = new Date()): string {
  const type = config.intervalType || "minutes"
  const count = Math.max(1, Number(config.intervalCount || "1"))
  const next = new Date(from)
  if (type === "seconds") {
    next.setSeconds(next.getSeconds() + count)
  } else if (type === "minutes") {
    next.setMinutes(next.getMinutes() + count)
  } else if (type === "hours") {
    next.setHours(next.getHours() + count)
  } else if (type === "days") {
    next.setDate(next.getDate() + count)
  } else if (type === "weeks") {
    next.setDate(next.getDate() + count * 7)
  } else if (type === "months") {
    next.setMonth(next.getMonth() + count)
  } else {
    next.setMinutes(next.getMinutes() + 1)
  }
  return next.toISOString()
}
