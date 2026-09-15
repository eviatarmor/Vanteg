import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { WorkflowExpressionInput } from "./WorkflowExpressionInput"

describe("WorkflowExpressionInput", () => {
  it("serializes chips as {{Node.path}} and warns on missing refs", () => {
    const onChange = vi.fn()
    render(
      <WorkflowExpressionInput
        value="Hi {{Webhook.body.email}}"
        items={[{ kind: "output", id: "Webhook.body.email", label: "Webhook.body.email" }]}
        availablePaths={["Webhook.body"]}
        onChange={onChange}
      />
    )
    expect(screen.getByText("Webhook.body.email")).toBeInTheDocument()
    expect(screen.queryByText(/Missing reference/)).not.toBeInTheDocument()
  })

  it("warns when a chip path is not upstream", () => {
    render(
      <WorkflowExpressionInput
        value="{{Missing.token}}"
        items={[]}
        availablePaths={["Webhook.body"]}
        onChange={() => {}}
      />
    )
    expect(screen.getByText(/Missing reference: Missing.token/)).toBeInTheDocument()
  })
})
