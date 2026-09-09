import { afterEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_WEBHOOK_SAMPLE_PAYLOAD,
  parseWebhookHeaders,
  parseWebhookPayload,
  simulateWebhookTest,
} from "./webhook-test"

describe("webhook-test", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("parses header lines and rejects malformed ones", () => {
    expect(parseWebhookHeaders("Content-Type: application/json\nX-Test: 1")).toEqual({
      ok: true,
      value: {
        "Content-Type": "application/json",
        "X-Test": "1",
      },
    })
    expect(parseWebhookHeaders("bad-line")).toEqual({
      ok: false,
      error: 'Invalid header line "bad-line". Use Name: value per line.',
    })
  })

  it("requires valid JSON payload", () => {
    expect(parseWebhookPayload("")).toEqual({
      ok: false,
      error: "Sample payload is required.",
    })
    expect(parseWebhookPayload("{")).toEqual({
      ok: false,
      error: "Sample payload must be valid JSON.",
    })
    expect(parseWebhookPayload(DEFAULT_WEBHOOK_SAMPLE_PAYLOAD)).toMatchObject({
      ok: true,
      value: {
        event: "test",
        id: "evt_sample",
      },
    })
  })

  it("simulates a local success response without HTTP", async () => {
    vi.useFakeTimers()
    const pending = simulateWebhookTest(
      {
        payloadText: '{"ping":true}',
        headersText: "X-Trace: abc",
        secret: "whsec_test",
        path: "/hooks/demo",
        method: "POST",
      },
      { delayMs: 50 }
    )
    await vi.advanceTimersByTimeAsync(50)
    const result = await pending
    expect(result.ok).toBe(true)
    expect(result.status).toBe(200)
    expect(result.statusText).toBe("OK")
    const body = JSON.parse(result.body) as {
      path: string
      headers: Record<string, string>
      signature: { verified: boolean }
    }
    expect(body.path).toBe("/hooks/demo")
    expect(body.headers["X-Trace"]).toBe("abc")
    expect(body.signature.verified).toBe(true)
  })

  it("returns an error result for invalid JSON", async () => {
    const result = await simulateWebhookTest(
      { payloadText: "not-json" },
      { delayMs: 0 }
    )
    expect(result.ok).toBe(false)
    expect(result.status).toBe(400)
    expect(result.errorMessage).toBe("Sample payload must be valid JSON.")
  })
})
