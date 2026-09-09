import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { InboxPage } from "./InboxPage"
import { getPendingInboxCount, resetInbox } from "./model/store"

describe("InboxPage", () => {
  beforeEach(() => {
    resetInbox()
  })

  it("lists pending work with approve, deny, and always approve", () => {
    render(<InboxPage />)

    expect(screen.getByRole("heading", { name: "Inbox" })).toBeInTheDocument()
    expect(screen.getByText("Send a Slack reply in #customers")).toBeInTheDocument()
    expect(screen.getByText("Slack credential needs renewal")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(3)
    expect(screen.getAllByRole("button", { name: "Deny" })).toHaveLength(3)
    expect(screen.getAllByRole("button", { name: "Always approve" })).toHaveLength(3)
  })

  it("removes a card after approve and updates the pending count", async () => {
    const user = userEvent.setup()
    render(<InboxPage />)

    expect(getPendingInboxCount()).toBe(3)
    await user.click(screen.getAllByRole("button", { name: "Approve" })[0]!)

    expect(screen.queryByText("Send a Slack reply in #customers")).not.toBeInTheDocument()
    expect(getPendingInboxCount()).toBe(2)
  })

  it("shows an empty state when everything is decided", async () => {
    const user = userEvent.setup()
    render(<InboxPage />)

    while (screen.queryAllByRole("button", { name: "Deny" }).length > 0) {
      await user.click(screen.getAllByRole("button", { name: "Deny" })[0]!)
    }

    expect(screen.getByRole("heading", { name: "Inbox is empty" })).toBeInTheDocument()
    expect(getPendingInboxCount()).toBe(0)
  })
})
