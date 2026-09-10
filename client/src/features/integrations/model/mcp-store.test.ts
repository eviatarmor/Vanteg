import { afterEach, describe, expect, it } from "vitest"

import {
  addMcpServersFromInput,
  getMcpServers,
  removeMcpServer,
  resetMcpServers,
} from "./mcp-store"

describe("mcp-store", () => {
  afterEach(() => {
    resetMcpServers()
  })

  it("adds a server from an npx command and can remove it", () => {
    const result = addMcpServersFromInput(
      "npx -y @modelcontextprotocol/server-github"
    )
    expect(result.ok).toBe(true)
    expect(getMcpServers()).toHaveLength(1)
    expect(getMcpServers()[0]?.name).toBe("github")
    removeMcpServer(getMcpServers()[0]!.id)
    expect(getMcpServers()).toHaveLength(0)
  })

  it("uses an explicit name when adding from a kind", () => {
    const result = addMcpServersFromInput(
      "@modelcontextprotocol/server-github",
      { kind: "npx", name: "Docs MCP" }
    )
    expect(result.ok).toBe(true)
    expect(getMcpServers()[0]?.name).toBe("Docs MCP")
    expect(getMcpServers()[0]?.source).toBe("npx")
  })

  it("returns a parse error for unknown input", () => {
    const result = addMcpServersFromInput("not an mcp snippet")
    expect(result.ok).toBe(false)
    expect(getMcpServers()).toHaveLength(0)
  })
})
