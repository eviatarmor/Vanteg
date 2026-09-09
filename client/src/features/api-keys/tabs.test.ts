import { describe, expect, it } from "vitest"

import { apiKeyTabs } from "./tabs"

describe("apiKeyTabs", () => {
  it("lists Private keys and Public keys", () => {
    expect(apiKeyTabs.map((tab) => tab.label)).toEqual(["Private keys", "Public keys"])
  })
})
