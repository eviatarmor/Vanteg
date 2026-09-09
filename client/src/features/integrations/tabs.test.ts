import { describe, expect, it } from "vitest"

import { integrationTabs } from "./tabs"

describe("integrationTabs", () => {
  it("defines Integrations and Custom Credentials tabs", () => {
    expect(integrationTabs.map((tab) => tab.id)).toEqual([
      "integrations",
      "custom-credentials",
    ])
    expect(integrationTabs[0]?.newAction.label).toBe("Add connector")
    expect(integrationTabs[1]?.newAction.label).toBe("New credential")
  })
})
