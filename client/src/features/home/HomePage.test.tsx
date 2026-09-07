import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { HomePage } from "./HomePage"

describe("HomePage", () => {
  it("shows an empty dashboard card instead of a placeholder sentence", () => {
    render(<HomePage />)

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Nothing on the dashboard yet" })).toBeInTheDocument()
    expect(screen.queryByText("Your home dashboard will appear here.")).not.toBeInTheDocument()
  })
})
