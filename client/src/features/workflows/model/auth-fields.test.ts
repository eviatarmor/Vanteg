import { describe, expect, it } from "vitest"

import { customCredentialAuthFields, isInlineAuthSuperseded } from "./auth-fields"

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
})
