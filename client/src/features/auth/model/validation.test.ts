import { describe, expect, it } from "vitest"

import { validateLogin, validateSignUp } from "./validation"

describe("auth validation", () => {
  it("requires email and password on login", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Email is required",
      password: "Password is required",
    })
  })

  it("checks basic email shape on login", () => {
    expect(validateLogin({ email: "not-an-email", password: "x" }).email).toBe(
      "Enter a valid email address"
    )
  })

  it("requires name and matching passwords on sign-up", () => {
    expect(
      validateSignUp({
        name: "",
        email: "ok@vanteg.test",
        password: "secret",
        confirmPassword: "other",
      })
    ).toEqual({
      name: "Name is required",
      confirmPassword: "Passwords do not match",
    })
  })
})
