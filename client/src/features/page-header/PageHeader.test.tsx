import { render, screen } from "@testing-library/react"
import { Home } from "lucide-react"
import { describe, expect, it } from "vitest"

import { PageHeader } from "./PageHeader"

describe("PageHeader", () => {
  it("renders a page title, icon, subtitle, and header separator", () => {
    render(
      <PageHeader
        title="Workflows"
        subtitle="Build, draft, and run automations."
        icon={Home}
      />
    )

    expect(screen.getByRole("heading", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByText("Build, draft, and run automations.")).toBeInTheDocument()
    const heading = screen.getByRole("heading", { name: "Workflows" })
    expect(heading.closest("div")?.parentElement).toHaveClass("border-b")
    expect(heading.closest("div")?.querySelector("svg")).toBeInTheDocument()
  })
})
