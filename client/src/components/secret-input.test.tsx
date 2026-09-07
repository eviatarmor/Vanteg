import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { SecretInput } from "./secret-input"

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <SecretInput
      aria-label="Secret"
      value={value}
      onValueChange={setValue}
      data-real={value}
    />
  )
}

describe("SecretInput", () => {
  it("shows only the last character of a saved secret", () => {
    render(<Harness initial="hidden" />)

    expect(screen.getByLabelText("Secret")).toHaveValue("*****n")
    expect(screen.getByLabelText("Secret")).not.toHaveAttribute("type", "password")
  })

  it("keeps earlier characters hidden while typing", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText("Secret"), "ab")

    expect(screen.getByLabelText("Secret")).toHaveValue("*b")
    expect(screen.getByLabelText("Secret")).toHaveAttribute("data-real", "ab")
  })
})
