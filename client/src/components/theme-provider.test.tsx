import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider, useTheme } from "./theme-provider"

const STORAGE_KEY = "theme"

function ThemeProbe() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={() => setTheme("light")}>
        Light
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        Dark
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        System
      </button>
    </div>
  )
}

function renderWithTheme(
  ui: import("react").ReactNode,
  options?: { defaultTheme?: "light" | "dark" | "system" }
) {
  return render(
    <ThemeProvider
      defaultTheme={options?.defaultTheme ?? "system"}
      storageKey={STORAGE_KEY}
    >
      {ui}
    </ThemeProvider>
  )
}

function stubMatchMedia(matchesDark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const mediaQueryList = {
    matches: matchesDark,
    media: "(prefers-color-scheme: dark)",
    onchange: null as ((event: MediaQueryListEvent) => void) | null,
    addEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void
    ) => {
      listeners.add(listener)
    },
    removeEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void
    ) => {
      listeners.delete(listener)
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    dispatchEvent: () => false,
  }

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      if (query.includes("prefers-color-scheme: dark")) {
        return mediaQueryList
      }

      return {
        ...mediaQueryList,
        matches: false,
        media: query,
      }
    })
  )

  return {
    setMatchesDark(next: boolean) {
      mediaQueryList.matches = next
      const event = { matches: next } as MediaQueryListEvent
      for (const listener of listeners) {
        listener(event)
      }
    },
  }
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("light", "dark")
    stubMatchMedia(false)
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("light", "dark")
    vi.unstubAllGlobals()
  })

  it("applies the light class on documentElement and persists preference", async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeProbe />)

    await user.click(screen.getByRole("button", { name: "Light" }))

    expect(screen.getByTestId("theme")).toHaveTextContent("light")
    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light")
  })

  it("applies the dark class on documentElement and persists preference", async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeProbe />)

    await user.click(screen.getByRole("button", { name: "Dark" }))

    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark")
  })

  it("resolves system preference from matchMedia and persists system", async () => {
    const user = userEvent.setup()
    stubMatchMedia(true)
    renderWithTheme(<ThemeProbe />, { defaultTheme: "light" })

    await user.click(screen.getByRole("button", { name: "System" }))

    expect(screen.getByTestId("theme")).toHaveTextContent("system")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe("system")
  })

  it("restores a stored preference on mount and applies its class", () => {
    localStorage.setItem(STORAGE_KEY, "dark")

    renderWithTheme(<ThemeProbe />)

    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("re-applies the resolved class when system preference changes", () => {
    const media = stubMatchMedia(false)
    localStorage.setItem(STORAGE_KEY, "system")

    renderWithTheme(<ThemeProbe />)

    expect(document.documentElement.classList.contains("light")).toBe(true)

    act(() => {
      media.setMatchesDark(true)
    })

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
  })
})
