import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import {
  clearSession,
  resetAuthSession,
  setSession,
} from "@/features/auth/model/session"
import { resetAssistantOpen } from "@/features/assistant/model/open-store"
import { resetInbox } from "@/features/inbox/model/store"
import { resetOnboarding } from "@/features/home/model/onboarding-store"

import { AppShell } from "./AppShell"

function renderShell(path = "/") {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <div>Login shell</div> },
      {
        path: "/",
        Component: AppShell,
        children: [{ index: true, element: <div>Home body</div> }],
      },
    ],
    { initialEntries: [path] }
  )
  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

describe("AppShell soft gate", () => {
  beforeEach(() => {
    resetInbox()
    resetAuthSession()
    resetAssistantOpen()
    resetOnboarding()
  })

  afterEach(() => {
    resetAuthSession()
    vi.unstubAllEnvs()
  })

  it("renders the app when DEV/test soft-default is authenticated", () => {
    renderShell()
    expect(screen.getByText("Home body")).toBeInTheDocument()
    expect(screen.getByText("Vanteg")).toBeInTheDocument()
  })

  it("redirects to /login when VITE_REQUIRE_AUTH=true and storage is empty", () => {
    vi.stubEnv("VITE_REQUIRE_AUTH", "true")
    resetAuthSession()
    renderShell()
    expect(screen.getByText("Login shell")).toBeInTheDocument()
    expect(screen.queryByText("Home body")).not.toBeInTheDocument()
  })

  it("redirects to /login when explicitly logged out", () => {
    clearSession()
    renderShell()
    expect(screen.getByText("Login shell")).toBeInTheDocument()
    expect(screen.queryByText("Home body")).not.toBeInTheDocument()
  })

  it("allows access after mock login", () => {
    setSession({ email: "alex@vanteg.test", name: "Alex" })
    renderShell()
    expect(screen.getByText("Home body")).toBeInTheDocument()
    expect(screen.getByText("Alex")).toBeInTheDocument()
  })
})

describe("AppShell accessibility", () => {
  beforeEach(() => {
    resetInbox()
    resetAuthSession()
    resetAssistantOpen()
    resetOnboarding()
    setSession({ email: "alex@vanteg.test", name: "Alex" })
  })

  afterEach(() => {
    resetAuthSession()
  })

  it("exposes a skip link that targets the main landmark", async () => {
    const user = userEvent.setup()
    renderShell()

    const skip = screen.getByRole("link", { name: "Skip to main content" })
    expect(skip).toHaveAttribute("href", "#main-content")

    const main = document.getElementById("main-content")
    expect(main).not.toBeNull()
    expect(main!.tagName).toBe("MAIN")
    expect(screen.getByRole("main")).toBe(main)

    await user.click(skip)
    expect(document.activeElement).toBe(main)
  })
})
