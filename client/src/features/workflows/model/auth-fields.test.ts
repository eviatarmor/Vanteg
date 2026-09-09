import { describe, expect, it } from "vitest"

import {
  customCredentialAuthFields,
  getNodeTypeForEditor,
  isInlineAuthSuperseded,
  nodeNeedsCustomCredential,
} from "./auth-fields"

describe("auth-fields", () => {
  it("includes credentialId picker and an inline secret field", () => {
    const fields = customCredentialAuthFields()
    expect(fields.map((field) => field.key)).toEqual(["credentialId", "token"])
    expect(fields[0]?.control).toBe("credential")
    expect(fields[1]?.secret).toBe(true)
    expect(fields[1]?.inlineAuth).toBe(true)
  })

  it("hides inline auth when a credential is selected", () => {
    const token = customCredentialAuthFields()[1]!
    expect(isInlineAuthSuperseded(token, {})).toBe(false)
    expect(isInlineAuthSuperseded(token, { credentialId: "" })).toBe(false)
    expect(isInlineAuthSuperseded(token, { credentialId: "cred_1" })).toBe(true)
  })

  it("augments HTTP auth nodes with credential fields for the editor", () => {
    for (const id of ["http", "http-poll", "http-download", "webhook"] as const) {
      expect(nodeNeedsCustomCredential(id)).toBe(true)
      const keys = getNodeTypeForEditor(id)?.fields.map((field) => field.key) ?? []
      expect(keys).toContain("credentialId")
      expect(keys).toContain("token")
    }
    expect(getNodeTypeForEditor("manual")?.fields.some((f) => f.key === "credentialId")).toBe(
      false
    )
  })
})
