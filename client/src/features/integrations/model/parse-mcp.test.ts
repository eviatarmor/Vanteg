import { describe, expect, it } from "vitest"

import { parseMcpInput } from "./parse-mcp"

describe("parseMcpInput", () => {
  it("parses an mcp.json snippet with multiple servers", () => {
    const result = parseMcpInput(`{
      "mcpServers": {
        "github": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-github"],
          "env": { "GITHUB_TOKEN": "secret" }
        },
        "remote": { "url": "https://mcp.example.com/sse" }
      }
    }`)
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    expect(result.source).toBe("json")
    expect(result.servers).toEqual([
      {
        name: "github",
        transport: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_TOKEN: "secret" },
      },
      {
        name: "remote",
        transport: "sse",
        url: "https://mcp.example.com/sse",
      },
    ])
  })

  it("parses an npx command", () => {
    const result = parseMcpInput(
      "npx -y @modelcontextprotocol/server-filesystem /tmp"
    )
    expect(result).toEqual({
      ok: true,
      source: "npx",
      servers: [
        {
          name: "filesystem",
          transport: "stdio",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
        },
      ],
    })
  })

  it("parses a docker run command", () => {
    const result = parseMcpInput(
      "docker run -i --rm -e API_KEY=abc ghcr.io/github/github-mcp-server"
    )
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    expect(result.source).toBe("docker")
    expect(result.servers[0]).toMatchObject({
      name: "github-mcp-server",
      transport: "stdio",
      command: "docker",
      env: { API_KEY: "abc" },
    })
    expect(result.servers[0]?.args).toEqual(
      expect.arrayContaining([
        "run",
        "-e",
        "API_KEY=abc",
        "ghcr.io/github/github-mcp-server",
      ])
    )
  })

  it("parses claude mcp add stdio and http commands", () => {
    const stdio = parseMcpInput(
      "claude mcp add playwright -- npx @playwright/mcp@latest"
    )
    expect(stdio).toEqual({
      ok: true,
      source: "claude",
      servers: [
        {
          name: "playwright",
          transport: "stdio",
          command: "npx",
          args: ["@playwright/mcp@latest"],
        },
      ],
    })
    const http = parseMcpInput(
      "claude mcp add --transport http stripe https://mcp.stripe.com"
    )
    expect(http).toEqual({
      ok: true,
      source: "claude",
      servers: [
        {
          name: "stripe",
          transport: "http",
          url: "https://mcp.stripe.com",
        },
      ],
    })
  })

  it("parses a remote URL", () => {
    const result = parseMcpInput("https://mcp.asana.com/sse")
    expect(result).toEqual({
      ok: true,
      source: "url",
      servers: [
        {
          name: "mcp",
          transport: "sse",
          url: "https://mcp.asana.com/sse",
        },
      ],
    })
  })

  it("parses a Cursor install link", () => {
    const config = btoa(
      JSON.stringify({ command: "npx", args: ["-y", "@upstash/context7-mcp"] })
    )
    const result = parseMcpInput(
      `cursor://anysphere.cursor-deeplink/mcp/install?name=context7&config=${config}`
    )
    expect(result).toEqual({
      ok: true,
      source: "cursor",
      servers: [
        {
          name: "context7",
          transport: "stdio",
          command: "npx",
          args: ["-y", "@upstash/context7-mcp"],
        },
      ],
    })
  })

  it("rejects empty and unknown input", () => {
    expect(parseMcpInput("").ok).toBe(false)
    expect(parseMcpInput("hello world").ok).toBe(false)
  })

  it("coerces a package name when the kind is npx", () => {
    const result = parseMcpInput("@modelcontextprotocol/server-github", "npx")
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    expect(result.source).toBe("npx")
    expect(result.servers[0]?.name).toBe("github")
  })

  it("rejects a URL when the kind is npx", () => {
    const result = parseMcpInput("https://mcp.example.com/sse", "npx")
    expect(result.ok).toBe(false)
  })
})
