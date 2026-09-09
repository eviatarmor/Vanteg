import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LoginPage } from "./LoginPage"
import { SignUpPage } from "./SignUpPage"
import {
  clearSession,
  getSession,
  hasMockSession,
  resetAuthSession,
} from "./model/session"

function renderSignUp(path = "/sign-up") {
  const router = createMemoryRouter(
    [
      { path: "/login", Component: LoginPage },
      { path: "/sign-up", Component: SignUpPage },
      { path: "/", element: <div>Home</div> },
    ],
    { initialEntries: [path] }
  )
  return { ...render(<RouterProvider router={router} />), router }
}

describe("SignUpPage", () => {
  beforeEach(() => {
    resetAuthSession()
    clearSession()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    resetAuthSession()
  })

  it("renders name, email, and SecretInput password fields (not type=password)", () => {
    renderSignUp()

    expect(
      screen.getByRole("heading", { name: "Create account" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()

    const password = screen.getByLabelText("Password")
    const confirm = screen.getByLabelText("Confirm password")
    expect(password).not.toHaveAttribute("type", "password")
    expect(confirm).not.toHaveAttribute("type", "password")
    expect(password).toHaveAttribute("type", "text")
    expect(confirm).toHaveAttribute("type", "text")

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    )
  })

  it("shows password mismatch validation", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderSignUp()

    await user.type(screen.getByLabelText("Name"), "Alex V")
    await user.type(screen.getByLabelText("Email"), "alex@vanteg.test")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.type(screen.getByLabelText("Confirm password"), "other")
    await user.click(screen.getByRole("button", { name: "Sign up" }))

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    expect(hasMockSession()).toBe(false)
  })

  it("creates a mock session and navigates home", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { router } = renderSignUp()

    await user.type(screen.getByLabelText("Name"), "Alex V")
    await user.type(screen.getByLabelText("Email"), "alex@vanteg.test")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.type(screen.getByLabelText("Confirm password"), "secret")
    await user.click(screen.getByRole("button", { name: "Sign up" }))

    await waitFor(() => {
      expect(getSession()).toEqual({
        email: "alex@vanteg.test",
        name: "Alex V",
      })
      expect(router.state.location.pathname).toBe("/")
    })
  })
})
