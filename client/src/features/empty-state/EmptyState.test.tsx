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

    expect(
      screen.getByRole("heading", { name: "No items yet" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "New item" }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it("renders a secondary action when provided", async () => {
    const user = userEvent.setup()
    const onSecondary = vi.fn()
    render(
      <EmptyState
        icon={Inbox}
        title="No items yet"
        description="Create one to get started."
        actionLabel="New item"
        onCreate={() => undefined}
        secondaryActionLabel="Open Integrations"
        onSecondary={onSecondary}
      />
    )

    await user.click(screen.getByRole("button", { name: "Open Integrations" }))
    expect(onSecondary).toHaveBeenCalledTimes(1)
  })

  it("hides the button when no action is provided", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Nothing here"
        description="Check back later."
      />
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("fills remaining space and centers the card by default", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items yet"
        description="Create one to get started."
      />
    )

    const heading = screen.getByRole("heading", { name: "No items yet" })
    const root = heading.parentElement?.parentElement
    expect(root?.className).toContain("flex-1")
    expect(root?.className).toContain("items-center")
    expect(root?.className).toContain("min-h-0")
    expect(root?.className).not.toContain("min-h-[28rem]")
  })

  it("aligns the card to the start of the panel", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No chats yet"
        description="Start a conversation."
        align="start"
      />
    )

    const heading = screen.getByRole("heading", { name: "No chats yet" })
    const root = heading.parentElement?.parentElement
    expect(root?.className).toContain("items-start")
    expect(root?.className).not.toContain("items-center")
    expect(root?.className).not.toContain("min-h-[28rem]")
  })

  it("omits the dashed border when unframed", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No chats yet"
        description="Start a conversation."
        framed={false}
      />
    )

    const heading = screen.getByRole("heading", { name: "No chats yet" })
    expect(heading.parentElement?.className).not.toContain("border-dashed")
  })
})
