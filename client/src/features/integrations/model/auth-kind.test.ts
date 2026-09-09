import { describe, expect, it } from "vitest"

import { authKindLabel } from "./auth-kind"

describe("authKindLabel", () => {
  it("renders catalog badges in compact uppercase", () => {
    expect(authKindLabel("oauth2")).toBe("OAUTH")
    expect(authKindLabel("api-key")).toBe("API KEY")
    expect(authKindLabel("jwt")).toBe("JWT")
    expect(authKindLabel("basic")).toBe("BASIC")
    expect(authKindLabel("bearer")).toBe("BEARER")
    expect(authKindLabel("service-account")).toBe("SERVICE ACCOUNT")
  })
})
