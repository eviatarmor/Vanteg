import { afterEach, describe, expect, it } from "vitest"

import { SECRET_MASK } from "@/features/data/model/mask-secret"

import {
  API_KEYS_STORAGE_KEY,
  createApiKey,
  deleteApiKey,
  hydrateApiKeys,
  resetApiKeysStore,
  retryApiKeysLoad,
  revokeApiKey,
  getApiKeysSnapshot,
} from "./store"

describe("api keys store", () => {
  afterEach(() => {
    resetApiKeysStore()
  })

  it("creates a key, persists metadata without the full secret, and revokes", () => {
    const { key, secret } = createApiKey({
      kind: "private-keys",
      name: "CI bot",
      scopes: ["read", "workflows"],
    })

    expect(secret.startsWith("vtg_sk_")).toBe(true)
    expect(key.prefix).toBeTruthy()
    expect(secret.includes(key.prefix.slice(-4)) || secret.startsWith(key.prefix)).toBe(
      true
    )
    expect(JSON.stringify(getApiKeysSnapshot().keys)).not.toContain(secret)
    expect(localStorage.getItem(API_KEYS_STORAGE_KEY)).toContain("CI bot")
    expect(localStorage.getItem(API_KEYS_STORAGE_KEY)).not.toContain(secret)

    const revoked = revokeApiKey(key.id)
    expect(revoked?.status).toBe("revoked")
    expect(getApiKeysSnapshot().keys[0]?.status).toBe("revoked")

    expect(deleteApiKey(key.id)).toBe(true)
    expect(getApiKeysSnapshot().keys).toHaveLength(0)
  })

  it("hydrates from localStorage and recovers from corrupt data", () => {
    createApiKey({ kind: "public-keys", name: "Webhook", scopes: [] })
    const raw = localStorage.getItem(API_KEYS_STORAGE_KEY)
    expect(raw).toBeTruthy()

    resetApiKeysStore()
    localStorage.setItem(API_KEYS_STORAGE_KEY, raw!)
    const ready = hydrateApiKeys()
    expect(ready.loadState).toBe("ready")
    expect(ready.keys).toHaveLength(1)
    expect(ready.keys[0]?.name).toBe("Webhook")

    localStorage.setItem(API_KEYS_STORAGE_KEY, "{not-json")
    const errored = hydrateApiKeys()
    expect(errored.loadState).toBe("error")
    expect(errored.loadError).toBeTruthy()

    const recovered = retryApiKeysLoad()
    expect(recovered.loadState).toBe("ready")
    expect(recovered.keys).toHaveLength(0)
  })

  it("keeps list previews non-revealing relative to SECRET_MASK helpers", () => {
    const { key, secret } = createApiKey({
      kind: "private-keys",
      name: "Ops",
      scopes: ["admin"],
    })
    expect(SECRET_MASK).toBe("*****")
    expect(key.prefix).not.toBe(secret)
  })
})
