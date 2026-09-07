import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Inbox } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { EmptyState } from "./EmptyState"

describe("EmptyState", () => {
  it("renders a dashed card with a create action", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <EmptyState
        icon={Inbox}
        title="No items yet"
        description="Create one to get started."
        actionLabel="New item"
        onCreate={onCreate}
      />
    )

    expect(screen.getByRole("heading", { name: "No items yet" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "New item" }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it("hides the button when no action is provided", () => {
    render(
      <EmptyState icon={Inbox} title="Nothing here" description="Check back later." />
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
