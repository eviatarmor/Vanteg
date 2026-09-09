import { describe, expect, it } from "vitest"

import { listResourceTypes, listResources } from "./resources.ts"

describe("listResources", () => {
  it("returns Slack channel options for slack.channel", () => {
    const channels = listResources("slack.channel")
    expect(channels.length).toBeGreaterThanOrEqual(4)
    expect(channels.map((row) => row.value)).toEqual(
      expect.arrayContaining(["#ops", "#incidents", "#eng", "#general"])
    )
    expect(channels.every((row) => row.label.includes(row.value) || row.label.length > 0)).toBe(
      true
    )
  })

  it("returns mock options for featured resource kinds", () => {
    const cases: Array<{ type: string; sample: string }> = [
      { type: "github.repo", sample: "acme/app" },
      { type: "sheets.sheet", sample: "Leads" },
      { type: "discord.channel", sample: "#alerts" },
      { type: "notion.page", sample: "Tasks" },
      { type: "calendar.calendar", sample: "primary" },
      { type: "forms.form", sample: "contact-form" },
    ]
    for (const { type, sample } of cases) {
      const rows = listResources(type)
      expect(rows.length).toBeGreaterThanOrEqual(3)
      expect(rows.map((row) => row.value)).toContain(sample)
      expect(rows.every((row) => row.label.length > 0)).toBe(true)
    }
  })

  it("returns an empty list for unknown resource types", () => {
    expect(listResources("unknown.thing")).toEqual([])
  })

  it("lists registered resource types", () => {
    expect(listResourceTypes()).toEqual([
      "calendar.calendar",
      "discord.channel",
      "forms.form",
      "github.repo",
      "notion.page",
      "sheets.sheet",
      "slack.channel",
    ])
  })
})
