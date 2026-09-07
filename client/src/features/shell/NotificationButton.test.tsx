import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"

import { NotificationButton } from "./NotificationButton"

describe("NotificationButton", () => {
  it("opens the inbox page instead of a dropdown", async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(
      [
        { path: "/", element: <NotificationButton /> },
        { path: "/inbox", element: <p>Inbox page</p> },
      ],
      { initialEntries: ["/"] }
    )

    render(<RouterProvider router={router} />)

    const link = screen.getByRole("link", { name: "Notifications" })
    expect(link).toHaveAttribute("href", "/inbox")
    expect(screen.queryByText(/all caught up/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await user.click(link)

    expect(screen.getByText("Inbox page")).toBeInTheDocument()
    expect(screen.queryByText(/all caught up/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
