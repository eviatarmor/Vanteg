import { useState } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ResourceSelectField } from "./ResourceSelectField"

function ControlledResourceSelect({
  initialValue = "",
  resourceType = "slack.channel",
  label = "Channel",
  placeholder = "#ops",
}: {
  initialValue?: string
  resourceType?: string
  label?: string
  placeholder?: string
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <ResourceSelectField
      id="channel"
      label={label}
      value={value}
      placeholder={placeholder}
      resourceType={resourceType}
      onChange={setValue}
    />
  )
}

describe("ResourceSelectField", () => {
  it("loads Slack channels and selects one", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ResourceSelectField
        id="channel"
        label="Channel"
        value=""
        placeholder="#ops"
        resourceType="slack.channel"
        onChange={onChange}
      />
    )

    const trigger = screen.getByRole("combobox", { name: "Channel" })
    await waitFor(() => expect(trigger).not.toBeDisabled())
    await user.click(trigger)

    expect(await screen.findByText("#incidents - Incident response")).toBeInTheDocument()
    await user.click(screen.getByText("#incidents - Incident response"))
    expect(onChange).toHaveBeenCalledWith("#incidents")
  })

  it("allows entering a custom channel value", async () => {
    const user = userEvent.setup()

    render(<ControlledResourceSelect initialValue="#ops" />)

    const trigger = screen.getByRole("combobox", { name: "Channel" })
    await waitFor(() => expect(trigger).not.toBeDisabled())
    await user.click(trigger)
    await user.click(await screen.findByText("Enter custom value..."))

    const input = screen.getByRole("textbox", { name: "Channel" })
    await user.clear(input)
    await user.type(input, "#custom-room")
    expect(input).toHaveValue("#custom-room")
  })

  it("loads GitHub repos from github.repo", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ResourceSelectField
        id="repo"
        label="Repository"
        value=""
        placeholder="owner/repo"
        resourceType="github.repo"
        onChange={onChange}
      />
    )

    const trigger = screen.getByRole("combobox", { name: "Repository" })
    await waitFor(() => expect(trigger).not.toBeDisabled())
    await user.click(trigger)

    expect(await screen.findByRole("option", { name: "acme/app" })).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: "acme/app" }))
    expect(onChange).toHaveBeenCalledWith("acme/app")
  })

  it("shows empty copy for unknown resource types", async () => {
    const user = userEvent.setup()

    render(
      <ResourceSelectField
        id="thing"
        label="Thing"
        value=""
        placeholder="Pick one"
        resourceType="unknown.thing"
        onChange={() => {}}
      />
    )

    const trigger = screen.getByRole("combobox", { name: "Thing" })
    await waitFor(() => expect(trigger).not.toBeDisabled())
    await user.click(trigger)
    expect(await screen.findByRole("status")).toHaveTextContent(
      "No resources available for this connection."
    )
  })
})
