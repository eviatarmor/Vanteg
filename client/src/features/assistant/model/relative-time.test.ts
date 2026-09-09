import { describe, expect, it } from "vitest"

import { formatRelativeTime } from "./relative-time"

describe("formatRelativeTime", () => {
  it("formats recent timestamps relatively", () => {
    const now = Date.parse("2026-09-09T06:00:00.000Z")
    expect(formatRelativeTime(now - 30_000, now)).toMatch(/second|now|ago/i)
    expect(formatRelativeTime(now - 3_600_000, now)).toMatch(/hour/i)
  })
})
