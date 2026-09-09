import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ExplorerSkeleton, ResourceError } from "./ResourceStatus"

describe("ResourceStatus", () => {
  it("exposes a busy loading skeleton", () => {
    render(<ExplorerSkeleton label="Loading data" />)
    expect(screen.getByRole("status", { name: "Loading data" })).toHaveAttribute(
      "aria-busy",
      "true"
    )
  })

  it("renders an error with retry", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <ResourceError title="Could not load" message="Something broke." onRetry={onRetry} />
    )
    expect(screen.getByText("Could not load")).toBeInTheDocument()
    expect(screen.getByText("Something broke.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
