import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { FeedbackButton } from "./FeedbackButton"
import { listFeedback, resetFeedback } from "./model/feedback-store"

describe("FeedbackButton", () => {
  beforeEach(() => {
    resetFeedback()
  })

  it("opens a dropdown with a textarea, send button, and anonymous review note", async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    expect(screen.queryByRole("textbox", { name: "Feedback" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Feedback" }))

    expect(screen.getByRole("textbox", { name: "Feedback" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    expect(
      screen.getByText("Everything is reviewed. Feedback is anonymous.")
    ).toBeInTheDocument()
  })

  it("sends written feedback and closes the dropdown", async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.type(screen.getByRole("textbox", { name: "Feedback" }), "The agents list is great.")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(listFeedback()).toEqual(["The agents list is great."])
    expect(screen.queryByRole("textbox", { name: "Feedback" })).not.toBeInTheDocument()
  })
})
