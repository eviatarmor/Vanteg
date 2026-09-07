import { describe, expect, it } from "vitest"

import { memoryTabs } from "./tabs"

describe("memoryTabs", () => {
  it("lists Memory bases and Knowledge bases", () => {
    expect(memoryTabs.map((tab) => tab.label)).toEqual([
      "Memory bases",
      "Knowledge bases",
    ])
  })
})
