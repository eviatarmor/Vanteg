export type McpTransport = "stdio" | "sse" | "http"

export type McpSource = "json" | "npx" | "docker" | "claude" | "url" | "cursor"

export const MCP_KINDS = [
  {
    id: "json",
    label: "mcp.json",
    fieldLabel: "Snippet",
    placeholder:
      '{"mcpServers":{"github":{"command":"npx","args":["-y","@modelcontextprotocol/server-github"]}}}',
    control: "textarea",
  },
  {
    id: "npx",
    label: "npx",
    fieldLabel: "Command",
    placeholder: "npx -y @modelcontextprotocol/server-github",
    control: "input",
  },
  {
    id: "docker",
    label: "Docker",
    fieldLabel: "Command",
    placeholder: "docker run -i --rm mcp/example",
    control: "input",
  },
  {
    id: "claude",
    label: "claude mcp add",
    fieldLabel: "Command",
    placeholder:
      "claude mcp add github -- npx -y @modelcontextprotocol/server-github",
    control: "input",
  },
  {
    id: "url",
    label: "URL",
    fieldLabel: "URL",
    placeholder: "https://mcp.example.com/sse",
    control: "input",
  },
  {
    id: "cursor",
    label: "Cursor link",
    fieldLabel: "Link",
    placeholder: "cursor://anysphere.cursor-deeplink/mcp/install?name=...",
    control: "input",
  },
] as const satisfies readonly {
  id: McpSource
  label: string
  fieldLabel: string
  placeholder: string
  control: "input" | "textarea"
}[]

export function mcpKindLabel(kind: McpSource): string {
  return MCP_KINDS.find((item) => item.id === kind)?.label ?? kind
}

export interface ParsedMcpServer {
  name: string
  transport: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
}

export type ParseMcpResult =
  | { ok: true; servers: ParsedMcpServer[]; source: McpSource }
  | { ok: false; error: string }

const FAIL_HINT =
  "Paste an mcp.json snippet, npx or docker command, claude mcp add, HTTP URL, or Cursor install link."

function fail(error: string): ParseMcpResult {
  return { ok: false, error }
}

function unwrap(raw: string): string {
  const trimmed = raw.trim()
  const fence = trimmed.match(
    /^```(?:json|bash|sh|zsh|shell)?\s*([\s\S]*?)```$/i
  )
  return (fence?.[1] ?? trimmed).trim()
}

function splitArgs(input: string): string[] {
  const out: string[] = []
  let current = ""
  let quote: '"' | "'" | null = null
  for (const ch of input.trim()) {
    if (quote) {
      if (ch === quote) {
        quote = null
      } else {
        current += ch
      }
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (/\s/.test(ch)) {
      if (current) {
        out.push(current)
        current = ""
      }
      continue
    }
    current += ch
  }
  if (current) {
    out.push(current)
  }
  return out
}

function nameFromPackage(pkg: string): string {
  const withoutTag = pkg.replace(/@latest$/, "").replace(/@[\d.]+$/, "")
  const last = withoutTag.split("/").at(-1) ?? withoutTag
  return last.replace(/^server-/, "") || "mcp"
}

function asEnv(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }
  const env: Record<string, string> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      env[key] = entry
    }
  }
  return Object.keys(env).length > 0 ? env : undefined
}

function asHeaders(value: unknown): Record<string, string> | undefined {
  return asEnv(value)
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }
  return value.filter((item): item is string => typeof item === "string")
}

function serverFromConfig(
  name: string,
  config: Record<string, unknown>
): ParsedMcpServer | null {
  const url = typeof config.url === "string" ? config.url : undefined
  const command =
    typeof config.command === "string" ? config.command : undefined
  const args = asStringArray(config.args)
  const env = asEnv(config.env)
  const headers = asHeaders(config.headers)
  const type = typeof config.type === "string" ? config.type : undefined
  const transportRaw =
    typeof config.transport === "string" ? config.transport : type

  if (url) {
    const transport: McpTransport =
      transportRaw === "sse" || url.includes("/sse") ? "sse" : "http"
    return { name, transport, url, env, headers }
  }
  if (command) {
    return { name, transport: "stdio", command, args, env, headers }
  }
  return null
}

function parseServerMap(
  record: Record<string, unknown>,
  source: McpSource
): ParseMcpResult {
  const servers: ParsedMcpServer[] = []
  for (const [name, value] of Object.entries(record)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue
    }
    const parsed = serverFromConfig(name, value as Record<string, unknown>)
    if (parsed) {
      servers.push(parsed)
    }
  }
  if (servers.length === 0) {
    return fail("JSON did not contain a usable MCP server command or URL.")
  }
  return { ok: true, servers, source }
}

function parseJson(raw: string): ParseMcpResult {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return fail("That JSON is not valid.")
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail("JSON must be an object describing one or more MCP servers.")
  }
  const record = value as Record<string, unknown>
  if (record.mcpServers && typeof record.mcpServers === "object") {
    return parseServerMap(record.mcpServers as Record<string, unknown>, "json")
  }
  if (record.servers && typeof record.servers === "object") {
    return parseServerMap(record.servers as Record<string, unknown>, "json")
  }
  if (
    record.mcp &&
    typeof record.mcp === "object" &&
    record.mcp !== null &&
    "servers" in record.mcp &&
    typeof (record.mcp as { servers?: unknown }).servers === "object"
  ) {
    return parseServerMap(
      (record.mcp as { servers: Record<string, unknown> }).servers,
      "json"
    )
  }
  const single = serverFromConfig("server", record)
  if (single) {
    return { ok: true, servers: [single], source: "json" }
  }
  return fail("JSON did not contain a usable MCP server command or URL.")
}

function decodeBase64(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  return atob(`${padded}${pad}`)
}

function parseCursor(raw: string): ParseMcpResult {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return fail("Could not parse that Cursor link.")
  }
  const name = url.searchParams.get("name")?.trim() || "cursor-mcp"
  const config = url.searchParams.get("config")
  if (!config) {
    return fail("Cursor link is missing a config parameter.")
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(decodeBase64(config))
  } catch {
    return fail("Cursor link config is not valid JSON.")
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return fail("Cursor link config must be a server object.")
  }
  const server = serverFromConfig(name, parsed as Record<string, unknown>)
  if (!server) {
    return fail("Cursor link did not include a command or URL.")
  }
  return { ok: true, servers: [server], source: "cursor" }
}

function parseUrl(raw: string): ParseMcpResult {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return fail("That URL is not valid.")
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return fail("MCP URLs must start with http:// or https://.")
  }
  const transport: McpTransport = url.pathname.includes("sse") ? "sse" : "http"
  const host = url.hostname.replace(/^www\./, "").split(".")[0] || "mcp"
  return {
    ok: true,
    source: "url",
    servers: [{ name: host, transport, url: raw }],
  }
}

function parseNpx(tokens: string[]): ParseMcpResult {
  const args =
    tokens[0] === "npx" || tokens[0] === "npm" ? tokens.slice(1) : tokens
  const cleaned = args[0] === "exec" ? args.slice(1) : args
  if (cleaned.length === 0) {
    return fail("npx command is missing a package name.")
  }
  const pkg = cleaned.find((token) => !token.startsWith("-"))
  if (!pkg) {
    return fail("npx command is missing a package name.")
  }
  return {
    ok: true,
    source: "npx",
    servers: [
      {
        name: nameFromPackage(pkg),
        transport: "stdio",
        command: "npx",
        args: cleaned[0]?.startsWith("-") ? cleaned : ["-y", ...cleaned],
      },
    ],
  }
}

function parseDocker(tokens: string[]): ParseMcpResult {
  const rest = tokens[0] === "docker" ? tokens.slice(1) : tokens
  if (rest[0] !== "run") {
    return fail("Docker MCP servers must use docker run.")
  }
  const env: Record<string, string> = {}
  const args = ["run"]
  let i = 1
  while (i < rest.length) {
    const token = rest[i]!
    if (token === "-e" || token === "--env") {
      const pair = rest[i + 1]
      if (pair?.includes("=")) {
        const [key, ...value] = pair.split("=")
        if (key) {
          env[key] = value.join("=")
        }
      }
      args.push(token)
      if (pair) {
        args.push(pair)
      }
      i += 2
      continue
    }
    args.push(token)
    i += 1
  }
  const image = rest.find(
    (token, index) =>
      index > 0 &&
      !token.startsWith("-") &&
      rest[index - 1] !== "-e" &&
      rest[index - 1] !== "--env" &&
      rest[index - 1] !== "--name"
  )
  return {
    ok: true,
    source: "docker",
    servers: [
      {
        name: nameFromPackage(image ?? "docker-mcp"),
        transport: "stdio",
        command: "docker",
        args,
        env: Object.keys(env).length > 0 ? env : undefined,
      },
    ],
  }
}

function parseClaude(tokens: string[]): ParseMcpResult {
  const rest = tokens[0] === "claude" ? tokens.slice(1) : tokens
  if (rest[0] !== "mcp" || rest[1] !== "add") {
    return fail("Expected a claude mcp add command.")
  }
  let transport: McpTransport = "stdio"
  const env: Record<string, string> = {}
  const headers: Record<string, string> = {}
  const leftover: string[] = []
  const flags = rest.slice(2)
  for (let i = 0; i < flags.length; i += 1) {
    const token = flags[i]!
    if (token === "--transport") {
      const value = flags[i + 1]
      if (value === "sse" || value === "http" || value === "stdio") {
        transport = value
      }
      i += 1
      continue
    }
    if (token === "--env") {
      const pair = flags[i + 1]
      if (pair?.includes("=")) {
        const [key, ...value] = pair.split("=")
        if (key) {
          env[key] = value.join("=")
        }
      }
      i += 1
      continue
    }
    if (token === "--header") {
      const pair = flags[i + 1]
      if (pair?.includes(":")) {
        const [key, ...value] = pair.split(":")
        if (key) {
          headers[key.trim()] = value.join(":").trim()
        }
      }
      i += 1
      continue
    }
    if (token === "--") {
      leftover.push(...flags.slice(i + 1))
      break
    }
    leftover.push(token)
  }
  const name = leftover[0] || "mcp"
  const commandTokens = leftover.slice(1)
  if (transport === "http" || transport === "sse") {
    const url = commandTokens[0] || leftover[1]
    if (!url || !/^https?:\/\//.test(url)) {
      return fail("Remote claude mcp add commands need an http(s) URL.")
    }
    return {
      ok: true,
      source: "claude",
      servers: [
        {
          name,
          transport,
          url,
          env: Object.keys(env).length > 0 ? env : undefined,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
        },
      ],
    }
  }
  if (commandTokens.length === 0) {
    return fail("claude mcp add is missing a command to run.")
  }
  return {
    ok: true,
    source: "claude",
    servers: [
      {
        name,
        transport: "stdio",
        command: commandTokens[0],
        args: commandTokens.slice(1),
        env: Object.keys(env).length > 0 ? env : undefined,
      },
    ],
  }
}

function looksLikeAnotherKind(text: string): boolean {
  return (
    text.startsWith("{") ||
    text.startsWith("[") ||
    /^(cursor|vscode):/i.test(text) ||
    /^https?:\/\//i.test(text) ||
    /^(npx|npm|docker|claude)\s/i.test(text)
  )
}

export function coerceMcpKindInput(kind: McpSource, raw: string): string {
  const text = unwrap(raw)
  if (!text || looksLikeAnotherKind(text)) {
    return text
  }
  if (kind === "npx") {
    return `npx -y ${text}`
  }
  if (kind === "docker") {
    return `docker run -i --rm ${text}`
  }
  if (kind === "claude") {
    return `claude mcp add ${text}`
  }
  return text
}

export function parseMcpInput(
  raw: string,
  expectedKind?: McpSource
): ParseMcpResult {
  const text = expectedKind
    ? coerceMcpKindInput(expectedKind, raw)
    : unwrap(raw)
  if (!text) {
    return fail(FAIL_HINT)
  }
  let result: ParseMcpResult
  if (/^(cursor|vscode):/i.test(text)) {
    result = parseCursor(text)
  } else if (text.startsWith("{") || text.startsWith("[")) {
    result = parseJson(text)
  } else {
    const tokens = splitArgs(text)
    if (tokens[0] === "claude") {
      result = parseClaude(tokens)
    } else if (tokens[0] === "docker") {
      result = parseDocker(tokens)
    } else if (
      tokens[0] === "npx" ||
      (tokens[0] === "npm" && tokens[1] === "exec")
    ) {
      result = parseNpx(tokens)
    } else if (/^https?:\/\//i.test(text)) {
      result = parseUrl(text)
    } else {
      result = fail(FAIL_HINT)
    }
  }
  if (expectedKind && result.ok && result.source !== expectedKind) {
    return fail(`That snippet is not a ${mcpKindLabel(expectedKind)}.`)
  }
  return result
}
