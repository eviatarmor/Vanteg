import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LoginPage } from "./LoginPage"
import { SignUpPage } from "./SignUpPage"
import {
  clearSession,
  hasMockSession,
  resetAuthSession,
  setSession,
} from "./model/session"

function renderLogin(path = "/login") {
  const router = createMemoryRouter(
    [
      { path: "/login", Component: LoginPage },
      { path: "/sign-up", Component: SignUpPage },
      { path: "/", element: <div>Home</div> },
      { path: "/workflows", element: <div>Workflows</div> },
    ],
    { initialEntries: [path] }
  )
  return { ...render(<RouterProvider router={router} />), router }
}

describe("LoginPage", () => {
  beforeEach(() => {
    resetAuthSession()
    clearSession()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    resetAuthSession()
  })

  it("renders email + SecretInput password (not type=password)", () => {
    renderLogin()

    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    const password = screen.getByLabelText("Password")
    expect(password).toBeInTheDocument()
    expect(password).not.toHaveAttribute("type", "password")
    expect(password).toHaveAttribute("type", "text")
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/sign-up"
    )
  })

  it("validates required fields", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderLogin()

    await user.click(screen.getByRole("button", { name: "Log in" }))

    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
    expect(hasMockSession()).toBe(false)
  })

  it("validates basic email shape", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderLogin()

    await user.type(screen.getByLabelText("Email"), "nope")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Log in" }))

    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument()
  })

  it("sets a mock session and navigates home on success", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { router } = renderLogin()

    await user.type(screen.getByLabelText("Email"), "alex@vanteg.test")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Log in" }))

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled()

    await waitFor(() => {
      expect(hasMockSession()).toBe(true)
      expect(router.state.location.pathname).toBe("/")
    })
  })

  it("honors ?next= deep link after mock login", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { router } = renderLogin(
      `/login?next=${encodeURIComponent("/workflows")}`
    )

    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      `/sign-up?next=${encodeURIComponent("/workflows")}`
    )

    await user.type(screen.getByLabelText("Email"), "alex@vanteg.test")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Log in" }))

    await waitFor(() => {
      expect(hasMockSession()).toBe(true)
      expect(router.state.location.pathname).toBe("/workflows")
    })
  })

  it("redirects to home when already logged in", () => {
    setSession({ email: "alex@vanteg.test", name: "Alex" })
    renderLogin()
    expect(screen.getByText("Home")).toBeInTheDocument()
  })

  it("redirects to ?next= when already logged in", () => {
    setSession({ email: "alex@vanteg.test", name: "Alex" })
    renderLogin(`/login?next=${encodeURIComponent("/workflows")}`)
    expect(screen.getByText("Workflows")).toBeInTheDocument()
  })
})
