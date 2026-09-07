import { describe, expect, it } from "vitest"

import { getActivePageTab } from "./page-tab"

describe("getActivePageTab", () => {
  it("defaults to the first tab when the query is missing", () => {
    expect(getActivePageTab("/data")).toEqual({
      pagePath: "/data",
      tabLabel: "Database",
    })
    expect(getActivePageTab("/memory")).toEqual({
      pagePath: "/memory",
      tabLabel: "Memory bases",
    })
  })

  it("uses the tab query when it matches", () => {
    expect(getActivePageTab("/data", "?tab=secrets")).toEqual({
      pagePath: "/data",
      tabLabel: "Secrets",
    })
    expect(getActivePageTab("/memory", "tab=knowledge-bases")).toEqual({
      pagePath: "/memory",
      tabLabel: "Knowledge bases",
    })
  })

  it("ignores unknown pages, integrations, and workflow editors", () => {
    expect(getActivePageTab("/")).toBeNull()
    expect(getActivePageTab("/agents")).toBeNull()
    expect(getActivePageTab("/integrations")).toBeNull()
    expect(getActivePageTab("/workflows/abc")).toBeNull()
  })
})
