export const DEFAULT_WEBHOOK_SAMPLE_PAYLOAD = `{
  "event": "test",
  "id": "evt_sample",
  "data": {
    "hello": "world"
  }
}`

export type WebhookTestPhase = "idle" | "loading" | "success" | "error"

export interface WebhookTestRequest {
  payloadText: string
  headersText?: string
  secret?: string
  path?: string
  method?: string
}

export interface WebhookTestResult {
  ok: boolean
  status: number
  statusText: string
  body: string
  errorMessage?: string
  receivedAt: number
}

type ParseOk<T> = { ok: true; value: T }
type ParseErr = { ok: false; error: string }
export type ParseResult<T> = ParseOk<T> | ParseErr

export function parseWebhookHeaders(
  text: string
): ParseResult<Record<string, string>> {
  const headers: Record<string, string> = {}
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  for (const line of lines) {
    const colon = line.indexOf(":")
    if (colon <= 0) {
      return {
        ok: false,
        error: `Invalid header line "${line}". Use Name: value per line.`,
      }
    }
    const name = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (!name) {
      return {
        ok: false,
        error: `Invalid header line "${line}". Header name is required.`,
      }
    }
    headers[name] = value
  }
  return { ok: true, value: headers }
}

export function parseWebhookPayload(text: string): ParseResult<unknown> {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, error: "Sample payload is required." }
  }
  try {
    return { ok: true, value: JSON.parse(trimmed) as unknown }
  } catch {
    return { ok: false, error: "Sample payload must be valid JSON." }
  }
}

export async function simulateWebhookTest(
  request: WebhookTestRequest,
  options: { delayMs?: number } = {}
): Promise<WebhookTestResult> {
  const delayMs = options.delayMs ?? 180
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  const payload = parseWebhookPayload(request.payloadText)
  if (!payload.ok) {
    return {
      ok: false,
      status: 400,
      statusText: "Bad Request",
      body: "",
      errorMessage: payload.error,
      receivedAt: Date.now(),
    }
  }

  const headersResult = parseWebhookHeaders(request.headersText ?? "")
  if (!headersResult.ok) {
    return {
      ok: false,
      status: 400,
      statusText: "Bad Request",
      body: "",
      errorMessage: headersResult.error,
      receivedAt: Date.now(),
    }
  }

  const method = (request.method || "POST").toUpperCase()
  const path = request.path?.trim() || "/hooks/vanteg"
  const secret = request.secret?.trim() ?? ""
  const responseBody = {
    ok: true,
    simulated: true,
    method,
    path,
    headers: headersResult.value,
    body: payload.value,
    signature: secret
      ? { verified: true, algorithm: "hmac-sha256" }
      : { verified: false, reason: "No signing secret provided" },
  }

  return {
    ok: true,
    status: 200,
    statusText: "OK",
    body: JSON.stringify(responseBody, null, 2),
    receivedAt: Date.now(),
  }
}
