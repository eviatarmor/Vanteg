import { describe, expect, it } from "vitest"

import {
  applyCustomCredentialDefaults,
  mergeCustomCredentialFields,
  validateCustomCredentialInput,
} from "./custom-credentials.ts"
import { createMockIntegrationsAdapter } from "./mock-adapter.ts"

describe("validateCustomCredentialInput", () => {
  it("requires name and bearer token", () => {
    const errors = validateCustomCredentialInput({
      name: "",
      kind: "bearer",
      fields: { token: "" },
    })
    expect(errors).toEqual({ name: "Required", token: "Required" })
  })

  it("allows blank secrets when editing", () => {
    const errors = validateCustomCredentialInput({
      name: "Prod",
      kind: "bearer",
      fields: { token: "" },
      allowBlankSecrets: true,
    })
    expect(errors).toBeUndefined()
  })

  it("applies api-key header default", () => {
    expect(applyCustomCredentialDefaults("api-key", { apiKey: "k" })).toEqual({
      apiKey: "k",
      headerName: "X-Api-Key",
    })
  })

  it("merges blank secret fields from previous", () => {
    const merged = mergeCustomCredentialFields(
      { apiKey: "kept", headerName: "Authorization" },
      { apiKey: "", headerName: "X-Api-Key" },
      "api-key"
    )
    expect(merged.apiKey).toBe("kept")
    expect(merged.headerName).toBe("X-Api-Key")
  })
})

describe("mock adapter custom credentials", () => {
  it("creates, lists, updates, and deletes", async () => {
    const adapter = createMockIntegrationsAdapter()
    const created = await adapter.createCustomCredential({
      name: "Stripe key",
      kind: "api-key",
      fields: { apiKey: "sk_live" },
    })
    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }
    expect(created.data.fields.headerName).toBe("X-Api-Key")

    const listed = await adapter.listCustomCredentials()
    expect(listed.ok && listed.data).toHaveLength(1)

    const updated = await adapter.updateCustomCredential({
      id: created.data.id,
      name: "Stripe live",
      fields: { apiKey: "", headerName: "Authorization" },
    })
    expect(updated.ok).toBe(true)
    if (!updated.ok) {
      return
    }
    expect(updated.data.name).toBe("Stripe live")
    expect(updated.data.fields.apiKey).toBe("sk_live")
    expect(updated.data.fields.headerName).toBe("Authorization")

    const deleted = await adapter.deleteCustomCredential(created.data.id)
    expect(deleted.ok).toBe(true)
    const after = await adapter.listCustomCredentials()
    expect(after.ok && after.data).toHaveLength(0)
  })

  it("returns validation errors for oauth2 without tokenUrl", async () => {
    const adapter = createMockIntegrationsAdapter()
    const result = await adapter.createCustomCredential({
      name: "CC",
      kind: "oauth2",
      fields: { clientId: "id", clientSecret: "secret" },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe("validation")
      expect(result.error.fields?.tokenUrl).toBe("Required")
    }
  })

  it("rejects update for unknown id", async () => {
    const adapter = createMockIntegrationsAdapter()
    const result = await adapter.updateCustomCredential({
      id: "missing",
      name: "x",
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe("not_found")
    }
  })
})
