import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { serializeConditionGroup } from "../model/conditions"
import { ConditionBuilder } from "./ConditionBuilder"

describe("ConditionBuilder", () => {
  it("hides Value 2 for unary operators", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ConditionBuilder
        value={serializeConditionGroup({
          join: "and",
          rules: [{ id: "r1", left: "{{Webhook.body}}", operator: "eq", right: "open" }],
        })}
        items={[]}
        availablePaths={["Webhook.body"]}
        onChange={onChange}
      />
    )
    expect(screen.getByLabelText("Value 2 for condition 1")).toBeInTheDocument()
    await user.click(screen.getByLabelText("Operator for condition 1"))
    await user.click(screen.getByRole("option", { name: "Exists" }))
    expect(onChange).toHaveBeenCalled()
    const last = onChange.mock.calls.at(-1)?.[0] as string
    expect(last).toContain("exists")
  })
})
