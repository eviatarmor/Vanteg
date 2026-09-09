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

  it("returns an empty list for unknown resource types", () => {
    expect(listResources("unknown.thing")).toEqual([])
  })

  it("lists registered resource types", () => {
    expect(listResourceTypes()).toEqual(["slack.channel"])
  })
})
