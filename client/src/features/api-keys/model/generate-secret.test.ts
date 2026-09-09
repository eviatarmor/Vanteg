import { describe, expect, it } from "vitest"

import { generateApiKeySecret, secretPrefix } from "./generate-secret"

describe("generateApiKeySecret", () => {
  it("builds private and public prefixes", () => {
    const privateSecret = generateApiKeySecret("private-keys")
    const publicSecret = generateApiKeySecret("public-keys")
    expect(privateSecret.startsWith("vtg_sk_")).toBe(true)
    expect(publicSecret.startsWith("vtg_pk_")).toBe(true)
    expect(privateSecret.length).toBeGreaterThan(20)
    expect(secretPrefix(privateSecret)).toMatch(/^vtg_sk_/)
    expect(secretPrefix(privateSecret).length).toBeLessThan(privateSecret.length)
  })
})
