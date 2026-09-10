import { LoaderCircle, Webhook } from "lucide-react"
import { useState } from "react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import { SecretInput } from "@/components/secret-input"

import {
  DEFAULT_WEBHOOK_SAMPLE_PAYLOAD,
  simulateWebhookTest,
  type WebhookTestPhase,
  type WebhookTestResult,
} from "../model/webhook-test"
import { CodeField } from "./CodeField"

function initialSecretValue(secret?: string) {
  if (secret === undefined) {
    return ""
  }
  return secret
}

function resolveWebhookPath(path?: string) {
  const trimmed = path?.trim()
  if (trimmed) {
    return trimmed
  }
  return "/hooks/vanteg"
}

function resolveWebhookMethod(method?: string) {
  if (method) {
    return method.toUpperCase()
  }
  return "POST"
}

function webhookTestFailure(error: unknown): WebhookTestResult {
  const message =
    error instanceof Error ? error.message : "Could not simulate webhook test."
  return {
    ok: false,
    status: 500,
    statusText: "Error",
    body: "",
    errorMessage: message,
    receivedAt: Date.now(),
  }
}

function SendTestButton({
  loading,
  onSend,
}: {
  loading: boolean
  onSend: () => void
}) {
  if (loading) {
    return (
      <Button type="button" size="sm" disabled onClick={() => void onSend()}>
        <LoaderCircle className="size-3.5 animate-spin" />
        Sending…
      </Button>
    )
  }
  return (
    <Button type="button" size="sm" onClick={() => void onSend()}>
      Send test
    </Button>
  )
}

function WebhookTestIdle() {
  return (
    <p
      className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground"
      data-testid="webhook-test-empty"
    >
      No test sent yet. Edit the sample payload and click Send test.
    </p>
  )
}

function WebhookTestLoading() {
  return (
    <div
      className="flex items-center gap-2 rounded-md border border-border px-3 py-4 text-sm text-muted-foreground"
      role="status"
      data-testid="webhook-test-loading"
    >
      <LoaderCircle className="size-4 animate-spin" />
      Simulating delivery…
    </div>
  )
}

function WebhookTestError({ result }: { result: WebhookTestResult }) {
  const detail = result.errorMessage ?? `${result.status} ${result.statusText}`
  return (
    <Alert variant="destructive" data-testid="webhook-test-error">
      <AlertTitle>Test failed</AlertTitle>
      <AlertDescription>{detail}</AlertDescription>
    </Alert>
  )
}

function WebhookTestSuccess({ result }: { result: WebhookTestResult }) {
  return (
    <Alert data-testid="webhook-test-success">
      <AlertTitle>
        {result.status} {result.statusText}
      </AlertTitle>
      <AlertDescription>
        <pre className="mt-2 max-h-48 overflow-auto font-mono text-xs whitespace-pre-wrap text-foreground">
          {result.body}
        </pre>
      </AlertDescription>
    </Alert>
  )
}

function WebhookTestStatus({
  phase,
  result,
}: {
  phase: WebhookTestPhase
  result: WebhookTestResult | null
}) {
  if (phase === "idle") {
    if (result) {
      return null
    }
    return <WebhookTestIdle />
  }
  if (phase === "loading") {
    return <WebhookTestLoading />
  }
  if (phase === "error") {
    if (!result) {
      return null
    }
    return <WebhookTestError result={result} />
  }
  if (phase === "success") {
    if (!result) {
      return null
    }
    return <WebhookTestSuccess result={result} />
  }
  return null
}

function WebhookTestFields({
  payload,
  headersText,
  secret,
  onPayloadChange,
  onHeadersChange,
  onSecretChange,
}: {
  payload: string
  headersText: string
  secret: string
  onPayloadChange: (value: string) => void
  onHeadersChange: (value: string) => void
  onSecretChange: (value: string) => void
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="webhook-test-payload">Sample payload</Label>
        <CodeField
          id="webhook-test-payload"
          language="json"
          value={payload}
          onChange={onPayloadChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="webhook-test-headers">Headers (optional)</Label>
        <Textarea
          id="webhook-test-headers"
          value={headersText}
          placeholder={"Content-Type: application/json\nX-Request-Id: demo"}
          className="min-h-20 font-mono text-xs"
          onChange={(event) => onHeadersChange(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="webhook-test-secret">Signing secret</Label>
        <SecretInput
          id="webhook-test-secret"
          aria-label="Signing secret"
          value={secret}
          placeholder="Optional shared secret"
          onValueChange={onSecretChange}
        />
        <p className="text-xs text-muted-foreground">
          Used only for this simulated delivery. Leave blank if unused.
        </p>
      </div>
    </>
  )
}

export function WebhookTestPanel({
  path,
  method,
  secret: initialSecret,
}: {
  path?: string
  method?: string
  secret?: string
}) {
  const [payload, setPayload] = useState(DEFAULT_WEBHOOK_SAMPLE_PAYLOAD)
  const [headersText, setHeadersText] = useState("")
  const [secret, setSecret] = useState(initialSecretValue(initialSecret))
  const [phase, setPhase] = useState<WebhookTestPhase>("idle")
  const [result, setResult] = useState<WebhookTestResult | null>(null)
  const resolvedPath = resolveWebhookPath(path)
  const resolvedMethod = resolveWebhookMethod(method)

  async function onSend() {
    setPhase("loading")
    setResult(null)
    try {
      const next = await simulateWebhookTest({
        payloadText: payload,
        headersText,
        secret,
        path: resolvedPath,
        method: resolvedMethod,
      })
      setResult(next)
      setPhase(next.ok ? "success" : "error")
    } catch (error) {
      setResult(webhookTestFailure(error))
      setPhase("error")
    }
  }

  return (
    <section className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-7 items-center justify-center rounded-md bg-muted">
          <Webhook className="size-3.5 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium">Test webhook</h3>
          <p className="text-xs text-muted-foreground">
            Send a sample payload locally. No network request is made.
          </p>
        </div>
      </div>

      <WebhookTestFields
        payload={payload}
        headersText={headersText}
        secret={secret}
        onPayloadChange={setPayload}
        onHeadersChange={setHeadersText}
        onSecretChange={setSecret}
      />

      <div className="flex items-center gap-2">
        <SendTestButton loading={phase === "loading"} onSend={onSend} />
        <p className="truncate text-xs text-muted-foreground">
          {resolvedMethod} {resolvedPath}
        </p>
      </div>

      <WebhookTestStatus phase={phase} result={result} />
    </section>
  )
}
