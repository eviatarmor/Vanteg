import type { DatabaseColumn } from "./types"

export const SYSTEM_COLUMN_IDS = ["createdAt", "updatedAt"] as const

export function isSystemColumnId(id: string): boolean {
  return id === "createdAt" || id === "updatedAt"
}

export function systemTimestampColumns(): DatabaseColumn[] {
  return [
    { id: "createdAt", name: "Created At", variant: "short-text", system: true },
    { id: "updatedAt", name: "Updated At", variant: "short-text", system: true },
  ]
}

export function nowTimestamp(): string {
  return new Date().toISOString()
}
