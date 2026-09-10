import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EmptyWorkflows } from "./EmptyWorkflows"

describe("EmptyWorkflows", () => {
  it("renders a card with a create action and no templates CTA", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <EmptyWorkflows
        title="No deployed workflows"
        description="Create a workflow to start connecting triggers and actions."
        actionLabel="New workflow"
        onCreate={onCreate}
      />
    )

    expect(
      screen.getByRole("heading", { name: "No deployed workflows" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "New workflow" }))
    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole("button", { name: "Browse templates" })
    ).not.toBeInTheDocument()
  })

  it("hides the button when no action is provided", () => {
    render(
      <EmptyWorkflows
        title="No runs yet"
        description="Runs will show up here."
      />
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
