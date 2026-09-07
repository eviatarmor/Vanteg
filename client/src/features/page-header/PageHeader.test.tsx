import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PageHeader } from "./PageHeader"

describe("PageHeader", () => {
  it("renders a page title and subtitle", () => {
    render(<PageHeader title="Workflows" subtitle="Build, draft, and run automations." />)

    expect(screen.getByRole("heading", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByText("Build, draft, and run automations.")).toBeInTheDocument()
  })
})
