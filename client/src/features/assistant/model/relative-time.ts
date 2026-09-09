const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
]

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  let duration = (timestamp - now) / 1000

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormat.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }

  return relativeTimeFormat.format(Math.round(duration), "year")
}
