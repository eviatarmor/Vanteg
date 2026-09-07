import type { ReactElement } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { PageTabs } from "./PageTabs"

function renderTabs(ui: ReactElement, path = "/") {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)
}

const tabs = [
  {
    id: "one",
    label: "One",
    description: "First panel",
    newAction: { label: "New one", placeholder: "Name" },
  },
  {
    id: "two",
    label: "Two",
    description: "Second panel",
    newAction: { label: "New two", placeholder: "Name" },
  },
] as const

describe("PageTabs", () => {
  it("shows the first tab panel by default and switches on click", async () => {
    const user = userEvent.setup()
    renderTabs(<PageTabs tabs={tabs} />)

    expect(screen.getByRole("tab", { name: "One" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Two" })).toBeInTheDocument()
    expect(screen.getByText("First panel")).toBeVisible()
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Two" }))

    expect(screen.getByText("Second panel")).toBeVisible()
    expect(screen.queryByText("First panel")).not.toBeInTheDocument()
  })

  it("opens a create prompt from the new button", async () => {
    const user = userEvent.setup()
    renderTabs(<PageTabs tabs={tabs} />)

    await user.click(screen.getAllByRole("button", { name: "New one" })[0]!)

    expect(screen.getByRole("dialog", { name: "New one" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument()
  })

  it("calls onNew immediately instead of opening a dialog", async () => {
    const user = userEvent.setup()
    const onNew = vi.fn()
    renderTabs(<PageTabs tabs={tabs} onNew={onNew} />)

    await user.click(screen.getAllByRole("button", { name: "New one" })[0]!)

    expect(onNew).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("opens a requested default tab", () => {
    renderTabs(<PageTabs tabs={tabs} defaultTab="two" />)

    expect(screen.getByText("Second panel")).toBeVisible()
    expect(screen.queryByText("First panel")).not.toBeInTheDocument()
  })

  it("submits the create prompt with the typed name", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    renderTabs(<PageTabs tabs={tabs} onCreate={onCreate} />)

    await user.click(screen.getAllByRole("button", { name: "New one" })[0]!)
    await user.type(screen.getByLabelText("Name"), "Alpha")
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ id: "one" }), "Alpha")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("submits a key and value when the tab asks for both", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const keyedTabs = [
      {
        id: "secrets",
        label: "Secrets",
        description: "Secrets",
        newAction: {
          label: "New secret",
          placeholder: "KEY_NAME",
          nameLabel: "Key",
          valueLabel: "Secret",
          valuePlaceholder: "Secret value",
          secret: true,
        },
      },
    ] as const
    renderTabs(<PageTabs tabs={keyedTabs} onCreate={onCreate} />)

    await user.click(screen.getAllByRole("button", { name: "New secret" })[0]!)
    await user.type(screen.getByLabelText("Key"), "JWT_SECRET")
    await user.type(screen.getByLabelText("Secret"), "hidden")

    expect(screen.getByLabelText("Secret")).toHaveValue("*****n")
    expect(screen.getByLabelText("Secret")).not.toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "secrets" }),
      "JWT_SECRET",
      "hidden"
    )
  })

  it("renders a title and subtitle above the tabs", () => {
    renderTabs(
      <PageTabs
        tabs={tabs}
        title="Workflows"
        subtitle="Build, draft, and run automations."
      />
    )

    expect(screen.getByRole("heading", { name: "Workflows" })).toBeInTheDocument()
    expect(screen.getByText("Build, draft, and run automations.")).toBeInTheDocument()
  })
})
