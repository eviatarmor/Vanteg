import { describe, expect, it } from "vitest"

import {
  customCredentialAuthFields,
  getNodeTypeForEditor,
  isInlineAuthSuperseded,
  nodeNeedsCustomCredential,
  patchConfigForCredential,
} from "./auth-fields"

describe("auth-fields", () => {
  it("includes credentialId picker and an inline secret field", () => {
    const fields = customCredentialAuthFields()
    expect(fields.map((field) => field.key)).toEqual(["credentialId", "token"])
    expect(fields[0]?.control).toBe("credential")
    expect(fields[1]?.secret).toBe(true)
    expect(fields[1]?.inlineAuth).toBe(true)
  })

  it("hides inline auth only when the selected credential still exists", () => {
    const token = customCredentialAuthFields()[1]!
    expect(isInlineAuthSuperseded(token, {}, ["cred_1"])).toBe(false)
    expect(isInlineAuthSuperseded(token, { credentialId: "" }, ["cred_1"])).toBe(false)
    expect(isInlineAuthSuperseded(token, { credentialId: "cred_1" }, ["cred_1"])).toBe(true)
    expect(isInlineAuthSuperseded(token, { credentialId: "cred_1" }, [])).toBe(false)
    expect(isInlineAuthSuperseded(token, { credentialId: "cred_gone" }, ["cred_1"])).toBe(false)
  })

  it("drops inline secrets when a credential id is set", () => {
    const fields = customCredentialAuthFields()
    const next = patchConfigForCredential(
      { url: "https://api.example", token: "pasted-secret", credentialId: "" },
      "cred_1",
      fields
    )
    expect(next).toEqual({ url: "https://api.example", credentialId: "cred_1" })
    expect(
      patchConfigForCredential({ url: "https://api.example", credentialId: "cred_1" }, "", fields)
    ).toEqual({ url: "https://api.example", credentialId: "" })
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
