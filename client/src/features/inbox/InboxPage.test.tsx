import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "sonner"

import { InboxPage } from "./InboxPage"
import { failNextInboxLoad, resetInboxLoadFlags } from "./model/load"
import {
  getPendingInboxCount,
  resetInbox,
  setDecideInboxDelay,
  setDecideInboxImpl,
} from "./model/store"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function renderInbox(path = "/inbox") {
  const router = createMemoryRouter(
    [
      { path: "/inbox", Component: InboxPage },
      { path: "/workflows", element: <div>Workflows destination</div> },
    ],
    { initialEntries: [path] }
  )
  return {
    router,
    ...render(<RouterProvider router={router} />),
  }
}

describe("InboxPage", () => {
  beforeEach(() => {
    resetInbox()
    resetInboxLoadFlags()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  it("shows a loading skeleton then pending work with approve, deny, and always approve", async () => {
    renderInbox()

    expect(screen.getByTestId("inbox-skeleton")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Inbox" })).toBeInTheDocument()

    expect(
      await screen.findByText("Send a Slack reply in #customers")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Slack credential needs renewal")
    ).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /^Approve:/ })).toHaveLength(3)
    expect(screen.getAllByRole("button", { name: /^Deny:/ })).toHaveLength(3)
    expect(
      screen.getAllByRole("button", { name: /^Always approve:/ })
    ).toHaveLength(3)
    expect(
      screen.getByRole("list", { name: "Pending inbox items" })
    ).toBeInTheDocument()
  })

  it("removes a card after approve and updates the pending count", async () => {
    const user = userEvent.setup()
    renderInbox()

    await screen.findByText("Send a Slack reply in #customers")
    expect(getPendingInboxCount()).toBe(3)

    await user.click(
      screen.getByRole("button", {
        name: "Approve: Send a Slack reply in #customers",
      })
    )

    await waitFor(() => {
      expect(
        screen.queryByText("Send a Slack reply in #customers")
      ).not.toBeInTheDocument()
    })
    expect(getPendingInboxCount()).toBe(2)
    expect(toast.success).toHaveBeenCalled()
  })

  it("keeps the card when decide fails", async () => {
    setDecideInboxImpl(async () => {
      throw new Error("Network down")
    })
    const user = userEvent.setup()
    renderInbox()

    await screen.findByText("Send a Slack reply in #customers")
    await user.click(
      screen.getByRole("button", {
        name: "Approve: Send a Slack reply in #customers",
      })
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Approve: Send a Slack reply in #customers",
        })
      ).not.toBeDisabled()
    })
    expect(
      screen.getByText("Send a Slack reply in #customers")
    ).toBeInTheDocument()
    expect(getPendingInboxCount()).toBe(3)
    expect(toast.error).toHaveBeenCalled()
  })

  it("shows an empty state with a next action when everything is decided", async () => {
    const user = userEvent.setup()
    const { router } = renderInbox()

    await screen.findByText("Send a Slack reply in #customers")

    while (screen.queryAllByRole("button", { name: /^Deny:/ }).length > 0) {
      await user.click(screen.getAllByRole("button", { name: /^Deny:/ })[0]!)
    }

    expect(
      await screen.findByRole("heading", { name: "Inbox is empty" })
    ).toBeInTheDocument()
    expect(getPendingInboxCount()).toBe(0)

    expect(
      screen.queryByRole("button", { name: "Browse templates" })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "New workflow" }))
    expect(router.state.location.pathname).toBe("/workflows")
  })

  it("shows human error copy and retries after a failed load", async () => {
    const user = userEvent.setup()
    failNextInboxLoad()
    renderInbox()

    const alert = await screen.findByRole("alert")
    expect(within(alert).getByText("Could not load inbox")).toBeInTheDocument()
    expect(
      within(alert).getByText(/couldn't load your inbox/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(
      await screen.findByText("Send a Slack reply in #customers")
    ).toBeInTheDocument()
  })

  it("disables decision buttons while an approve is pending", async () => {
    const user = userEvent.setup()
    setDecideInboxDelay(40)
    renderInbox()

    await screen.findByText("Send a Slack reply in #customers")
    const approve = screen.getByRole("button", {
      name: "Approve: Send a Slack reply in #customers",
    })
    const deny = screen.getByRole("button", {
      name: "Deny: Send a Slack reply in #customers",
    })

    const clickPromise = user.click(approve)
    await waitFor(() => {
      expect(deny).toBeDisabled()
      expect(approve).toBeDisabled()
    })
    await clickPromise

    await waitFor(() => {
      expect(
        screen.queryByText("Send a Slack reply in #customers")
      ).not.toBeInTheDocument()
    })
  })
})
