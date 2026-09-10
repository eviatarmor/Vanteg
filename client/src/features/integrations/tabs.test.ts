import { describe, expect, it } from "vitest"

import { integrationTabs } from "./tabs"

describe("integrationTabs", () => {
  it("defines Connectors, MCP Servers, and Custom Credentials tabs", () => {
    expect(integrationTabs.map((tab) => tab.id)).toEqual([
      "connectors",
      "mcp-servers",
      "custom-credentials",
    ])
    expect(integrationTabs.map((tab) => tab.label)).toEqual([
      "Connectors",
      "MCP Servers",
      "Custom Credentials",
    ])
    expect(integrationTabs[0]?.newAction.label).toBe("Add connector")
    expect(integrationTabs[1]?.newAction.label).toBe("Add MCP server")
    expect(integrationTabs[2]?.newAction.label).toBe("New credential")
  })
})
