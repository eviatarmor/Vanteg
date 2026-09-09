import { useEffect, useState } from "react"
import { CheckCircle2, Plug, XCircle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

import { PageHeader } from "@/features/page-header/PageHeader"

import { completeOAuthCallback } from "../model/store"

type CallbackStatus = "loading" | "success" | "error"

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<CallbackStatus>("loading")
  const [message, setMessage] = useState("Finishing the connection…")
  const [title, setTitle] = useState("Connecting")

  useEffect(() => {
    let cancelled = false

    async function finish() {
      const result = await completeOAuthCallback({
        code: searchParams.get("code") ?? undefined,
        state: searchParams.get("state") ?? undefined,
        error: searchParams.get("error") ?? undefined,
        errorDescription: searchParams.get("error_description") ?? undefined,
        provider: searchParams.get("provider") ?? undefined,
      })
      if (!result.ok) {
        if (cancelled) {
          return
        }
        setStatus("error")
        setTitle("Connection failed")
        setMessage(result.error.message)
        return
      }
      setStatus("success")
      setTitle("Connected")
      setMessage(`${result.data.name} is ready to use in your workflows.`)
    }

    void finish()
    return () => {
      cancelled = true
    }
    // Intentionally once on mount for this callback URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goIntegrations() {
    navigate("/integrations")
  }

  function retryIntegrations() {
    navigate("/integrations")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="OAuth"
        subtitle="Completing the managed connector sign-in."
        icon={Plug}
      />
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            {status === "loading" ? (
              <Spinner className="size-6" aria-label="Completing OAuth" />
            ) : null}
            {status === "success" ? (
              <CheckCircle2 className="size-6 text-foreground" aria-hidden />
            ) : null}
            {status === "error" ? (
              <XCircle className="size-6 text-destructive" aria-hidden />
            ) : null}
          </div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {status === "success" ? (
            <Button className="mt-6" onClick={goIntegrations}>
              Back to Integrations
            </Button>
          ) : null}
          {status === "error" ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={retryIntegrations}>
                Back to Integrations
              </Button>
              <Button onClick={retryIntegrations}>Try again</Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
