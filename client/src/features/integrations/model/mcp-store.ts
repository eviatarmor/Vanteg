import { useSyncExternalStore } from "react"

import {
  parseMcpInput,
  type McpSource,
  type ParsedMcpServer,
} from "./parse-mcp"

export interface McpServerRecord extends ParsedMcpServer {
  id: string
  source: string
  raw: string
  createdAt: number
}

const STORAGE_KEY = "vanteg.mcp-servers.v1"

const listeners = new Set<() => void>()
let servers: McpServerRecord[] = load()

function load(): McpServerRecord[] {
  if (typeof localStorage === "undefined") {
    return []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as McpServerRecord[]) : []
  } catch {
    return []
  }
}

function persist() {
  if (typeof localStorage === "undefined") {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
}

function emit() {
  persist()
  for (const listener of listeners) {
    listener()
  }
}

function uniqueName(name: string): string {
  const taken = new Set(servers.map((server) => server.name))
  if (!taken.has(name)) {
    return name
  }
  let index = 2
  while (taken.has(`${name}-${index}`)) {
    index += 1
  }
  return `${name}-${index}`
}

export function subscribeMcpServers(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getMcpServers(): McpServerRecord[] {
  return servers
}

export function useMcpServers(): McpServerRecord[] {
  return useSyncExternalStore(subscribeMcpServers, getMcpServers, getMcpServers)
}

export function addMcpServersFromInput(
  raw: string,
  options?: { name?: string; kind?: McpSource }
) {
  const parsed = parseMcpInput(raw, options?.kind)
  if (!parsed.ok) {
    return parsed
  }
  const createdAt = Date.now()
  const added: McpServerRecord[] = []
  const override = options?.name?.trim()
  parsed.servers.forEach((server, index) => {
    const record: McpServerRecord = {
      ...server,
      name: uniqueName(override || server.name),
      id: `mcp-${createdAt}-${index}`,
      source: parsed.source,
      raw,
      createdAt,
    }
    servers = [record, ...servers]
    added.push(record)
  })
  emit()
  return { ok: true as const, servers: added }
}

export function removeMcpServer(id: string) {
  servers = servers.filter((server) => server.id !== id)
  emit()
}

export function resetMcpServers() {
  servers = []
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
  emit()
}
