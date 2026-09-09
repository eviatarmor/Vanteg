import type { CurrentUser } from "../../shell/model/types"

export const AUTH_STORAGE_KEY = "vanteg.mock.auth"

export interface MockAuthSession {
  email: string
  name: string
}

const LOGGED_OUT = "logged-out"

function readRaw(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeRaw(value: string): boolean {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, value)
    return localStorage.getItem(AUTH_STORAGE_KEY) === value
  } catch {
    return false
  }
}

function clearRaw(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Ignore.
  }
}

/** Explicit mock session written by login / sign-up (not the DEV soft default). */
export function hasMockSession(): boolean {
  return getSession() != null
}

/**
 * Soft gate: true when a mock session exists, or when DEV/test has not
 * explicitly logged out (so existing demos keep working without login).
 */
export function isAuthenticated(): boolean {
  const raw = readRaw()
  if (raw === LOGGED_OUT) return false
  if (getSession()) return true
  return import.meta.env.DEV || import.meta.env.MODE === "test"
}

export function getSession(): MockAuthSession | null {
  const raw = readRaw()
  if (!raw || raw === LOGGED_OUT) return null
  try {
    const parsed = JSON.parse(raw) as Partial<MockAuthSession>
    if (!parsed?.email) return null
    return {
      email: parsed.email,
      name: parsed.name?.trim() || parsed.email,
    }
  } catch {
    return null
  }
}

export function setSession(session: MockAuthSession): boolean {
  return writeRaw(
    JSON.stringify({
      email: session.email.trim(),
      name: session.name.trim() || session.email.trim(),
    })
  )
}

export function clearSession(): boolean {
  return writeRaw(LOGGED_OUT) && readRaw() === LOGGED_OUT
}

export function safeReturnPath(from: unknown): string {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return "/"
  }
  if (from.includes("\\") || from.includes("://")) {
    return "/"
  }
  const hash = from.indexOf("#")
  const withoutHash = hash >= 0 ? from.slice(0, hash) : from
  const query = withoutHash.indexOf("?")
  const pathname = query >= 0 ? withoutHash.slice(0, query) : withoutHash
  if (pathname === "/login" || pathname === "/sign-up") {
    return "/"
  }
  return withoutHash
}

export function returnPathFromState(state: unknown): string {
  if (!state || typeof state !== "object") {
    return "/"
  }
  return safeReturnPath((state as { from?: unknown }).from)
}

/** Reset storage for tests (no logged-out marker). */
export function resetAuthSession(): void {
  clearRaw()
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

const fallbackUser: CurrentUser = {
  displayName: "Darren",
  email: "darren@vanteg.app",
  role: "Owner",
  initials: "DH",
}

/** Prefer mock session identity; fall back to catalog defaults when DEV soft-logged-in. */
export function resolveCurrentUser(): CurrentUser {
  const session = getSession()
  if (!session) return fallbackUser
  return {
    displayName: session.name,
    email: session.email,
    role: "Owner",
    initials: initialsFromName(session.name),
  }
}
