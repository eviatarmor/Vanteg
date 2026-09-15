import { describe, expect, it } from "vitest"

import { HOUR_OPTIONS, isValidCron, scheduleSummary } from "./schedule"

describe("schedule builder", () => {
  it("accepts 5-field cron and rejects junk", () => {
    expect(isValidCron("0 9 * * 1-5")).toBe(true)
    expect(isValidCron("not cron")).toBe(false)
  })

  it("covers hour labels from Midnight through 11 PM", () => {
    expect(HOUR_OPTIONS[0]).toEqual({ value: "0", label: "Midnight" })
    expect(HOUR_OPTIONS[12]).toEqual({ value: "12", label: "Noon" })
    expect(HOUR_OPTIONS[23]).toEqual({ value: "23", label: "11 PM" })
    expect(HOUR_OPTIONS).toHaveLength(24)
  })

  it("summarizes interval ranges", () => {
    expect(
      scheduleSummary({
        intervalType: "weeks",
        intervalCount: "2",
        weekdays: '["1","3"]',
        timezone: "UTC",
      })
    ).toMatch(/Monday/)
    expect(
      scheduleSummary({
        intervalType: "months",
        intervalCount: "1",
        monthDay: "15",
        timezone: "UTC",
      })
    ).toMatch(/day 15/)
  })
})
