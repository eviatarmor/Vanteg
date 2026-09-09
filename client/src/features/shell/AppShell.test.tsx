import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import {
  clearSession,
  resetAuthSession,
  setSession,
} from "@/features/auth/model/session"
import { resetInbox } from "@/features/inbox/model/store"

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
  })

  afterEach(() => {
    resetAuthSession()
  })

  it("renders the app when DEV/test soft-default is authenticated", () => {
    renderShell()
    expect(screen.getByText("Home body")).toBeInTheDocument()
    expect(screen.getByText("Vanteg")).toBeInTheDocument()
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
