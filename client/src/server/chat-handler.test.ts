import { describe, expect, it } from "vitest"

import { handleChatRequest, localAssistantReply } from "./chat-handler"

describe("chat handler", () => {
  it("describes the workflow when no API key is set", async () => {
    const request = new Request("http://freeze.local/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "1",
            role: "user",
            parts: [{ type: "text", text: "Explain this workflow" }],
          },
        ],
        workflow: {
          id: "wf-1",
          name: "Lead alerts",
          steps: [{ label: "Manual", catalogId: "manual" }],
        },
      }),
    })

    const response = await handleChatRequest(request)
    const text = await response.text()

    expect(response.headers.get("content-type")).toContain("text/event-stream")
    expect(text).toContain("Lead alerts")
    expect(text).toContain("Manual")
  })

  it("suggests a next step from the local reply", () => {
    expect(
      localAssistantReply("Suggest the next step", {
        path: "/workflows/wf-1",
        pageTitle: "Workflows",
        workflow: {
          id: "wf-1",
          name: "Lead alerts",
          steps: [{ label: "Webhook", catalogId: "webhook" }],
        },
      })
    ).toContain("HTTP Request")
  })
})
