import { LoaderCircle, Webhook } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
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
  const [secret, setSecret] = useState(initialSecret ?? "")
  const [phase, setPhase] = useState<WebhookTestPhase>("idle")
  const [result, setResult] = useState<WebhookTestResult | null>(null)
  const resolvedPath = path?.trim() || "/hooks/vanteg"
  const resolvedMethod = (method || "POST").toUpperCase()

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
      setResult({
        ok: false,
        status: 500,
        statusText: "Error",
        body: "",
        errorMessage:
          error instanceof Error ? error.message : "Could not simulate webhook test.",
        receivedAt: Date.now(),
      })
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

      <div className="grid gap-2">
        <Label htmlFor="webhook-test-payload">Sample payload</Label>
        <CodeField
          id="webhook-test-payload"
          language="json"
          value={payload}
          onChange={setPayload}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="webhook-test-headers">Headers (optional)</Label>
        <Textarea
          id="webhook-test-headers"
          value={headersText}
          placeholder={"Content-Type: application/json\nX-Request-Id: demo"}
          className="min-h-20 font-mono text-xs"
          onChange={(event) => setHeadersText(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="webhook-test-secret">Signing secret</Label>
        <SecretInput
          id="webhook-test-secret"
          aria-label="Signing secret"
          value={secret}
          placeholder="Optional shared secret"
          onValueChange={setSecret}
        />
        <p className="text-xs text-muted-foreground">
          Used only for this simulated delivery. Leave blank if unused.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={phase === "loading"}
          onClick={() => void onSend()}
        >
          {phase === "loading" ? (
            <>
              <LoaderCircle className="size-3.5 animate-spin" />
              Sending…
            </>
          ) : (
            "Send test"
          )}
        </Button>
        <p className="truncate text-xs text-muted-foreground">
          {resolvedMethod} {resolvedPath}
        </p>
      </div>

      {phase === "idle" && !result ? (
        <p
          className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground"
          data-testid="webhook-test-empty"
        >
          No test sent yet. Edit the sample payload and click Send test.
        </p>
      ) : null}

      {phase === "loading" ? (
        <div
          className="flex items-center gap-2 rounded-md border border-border px-3 py-4 text-sm text-muted-foreground"
          role="status"
          data-testid="webhook-test-loading"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Simulating delivery…
        </div>
      ) : null}

      {phase === "error" && result ? (
        <Alert variant="destructive" data-testid="webhook-test-error">
          <AlertTitle>Test failed</AlertTitle>
          <AlertDescription>
            {result.errorMessage ?? `${result.status} ${result.statusText}`}
          </AlertDescription>
        </Alert>
      ) : null}

      {phase === "success" && result ? (
        <Alert data-testid="webhook-test-success">
          <AlertTitle>
            {result.status} {result.statusText}
          </AlertTitle>
          <AlertDescription>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-foreground">
              {result.body}
            </pre>
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  )
}
