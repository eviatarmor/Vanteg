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

function writeRaw(value: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, value)
  } catch {
    // Ignore quota / private-mode failures in the mock shell.
  }
}

function clearRaw(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Ignore.
  }
}

function requireAuthStrict(): boolean {
  return String(import.meta.env.VITE_REQUIRE_AUTH ?? "").toLowerCase() === "true"
}

function softDevDefault(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === "test"
}

/** Explicit mock session written by login / sign-up (not the DEV soft default). */
export function hasMockSession(): boolean {
  return getSession() != null
}

/**
 * Soft gate for AppShell routes.
 *
 * - Explicit mock session → authenticated
 * - Storage value `logged-out` (set by logout) → not authenticated → /login
 * - Missing key in DEV/test → still authenticated so demos keep working
 * - Optional `VITE_REQUIRE_AUTH=true` disables the DEV soft default (strict mode)
 *
 * `/login` and `/sign-up` stay public (outside AppShell).
 */
export function isAuthenticated(): boolean {
  const raw = readRaw()
  if (raw === LOGGED_OUT) return false
  if (getSession()) return true
  if (requireAuthStrict()) return false
  return softDevDefault()
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

export function setSession(session: MockAuthSession): void {
  writeRaw(
    JSON.stringify({
      email: session.email.trim(),
      name: session.name.trim() || session.email.trim(),
    })
  )
}

/** Explicit logout: writes the logged-out marker so DEV soft-default does not auto-auth. */
export function clearSession(): void {
  writeRaw(LOGGED_OUT)
}

/** Reset storage for tests (no logged-out marker). */
export function resetAuthSession(): void {
  clearRaw()
}

/**
 * Safe in-app return path after mock login / sign-up.
 * Accepts only same-app relative paths (`/…`); rejects open redirects.
 */
export function resolvePostAuthPath(next: string | null | undefined): string {
  if (!next) return "/"
  const trimmed = next.trim()
  if (!trimmed.startsWith("/")) return "/"
  if (trimmed.startsWith("//")) return "/"
  if (trimmed.includes("://")) return "/"
  if (trimmed === "/login" || trimmed.startsWith("/login?")) return "/"
  if (trimmed === "/sign-up" || trimmed.startsWith("/sign-up?")) return "/"
  return trimmed
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

const fallbackUser: CurrentUser = {
  displayName: "Darren",
  role: "Owner",
  initials: "DH",
}

/** Prefer mock session identity; fall back to catalog defaults when DEV soft-logged-in. */
export function resolveCurrentUser(): CurrentUser {
  const session = getSession()
  if (!session) return fallbackUser
  return {
    displayName: session.name,
    role: "Owner",
    initials: initialsFromName(session.name),
  }
}
