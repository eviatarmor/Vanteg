import type { ApiKeyKind } from "./types"

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function randomSegment(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (const byte of bytes) {
    out += ALPHABET[byte % ALPHABET.length]
  }
  return out
}

export function generateApiKeySecret(kind: ApiKeyKind): string {
  const tag = kind === "private-keys" ? "sk" : "pk"
  return `vtg_${tag}_${randomSegment(32)}`
}

/** Prefix shown in lists — keeps enough to recognize the key without leaking it. */
export function secretPrefix(secret: string): string {
  const parts = secret.split("_")
  if (parts.length >= 3) {
    return `${parts[0]}_${parts[1]}_${(parts[2] ?? "").slice(0, 4)}`
  }
  return secret.slice(0, Math.min(12, secret.length))
}
