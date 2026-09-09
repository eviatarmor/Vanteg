import { Link } from "react-router"

import { customAuthKindLabel } from "@workspace/integrations"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Spinner } from "@workspace/ui/components/spinner"

import {
  retryCustomCredentialsLoad,
  useCustomCredentials,
  useCustomCredentialsError,
  useCustomCredentialsStatus,
} from "@/features/integrations/model/store"

const CREATE_HREF = "/integrations?tab=custom-credentials"

export function CredentialMultiPicker({
  value,
  onToggle,
  title = "Custom credentials",
  description = "Saved auth configs this agent may use. Secrets stay in Integrations — only ids are stored here.",
}: {
  value: string[]
  onToggle: (credentialId: string, enabled: boolean) => void
  title?: string
  description?: string
}) {
  const credentials = useCustomCredentials()
  const status = useCustomCredentialsStatus()
  const error = useCustomCredentialsError()
  const selected = new Set(value)

  return (
    <section className="grid gap-3" data-testid="credential-multi-picker">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      {status === "loading" || status === "idle" ? (
        <div className="flex items-center justify-center rounded-lg border border-border px-3 py-6">
          <Spinner className="size-5" aria-label="Loading credentials" />
        </div>
      ) : null}

      {status === "error" ? (
        <div
          className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3"
          data-testid="credential-multi-picker-error"
        >
          <p className="text-sm font-medium">Couldn’t load credentials</p>
          <p className="text-sm text-muted-foreground">
            {error ?? "Something went wrong."}
          </p>
          <Button type="button" size="sm" onClick={() => retryCustomCredentialsLoad()}>
            Retry
          </Button>
        </div>
      ) : null}

      {status === "ready" && credentials.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
          data-testid="credential-multi-picker-empty"
        >
          No custom credentials yet. Save one under{" "}
          <Link
            to={CREATE_HREF}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Integrations → Custom Credentials
          </Link>{" "}
          and assign it here. Do not paste secrets into the agent form.
        </div>
      ) : null}

      {status === "ready" && credentials.length > 0 ? (
        <ul className="grid gap-2">
          {credentials.map((credential) => {
            const checked = selected.has(credential.id)
            return (
              <li key={credential.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-3 py-2">
                  <Checkbox
                    className="mt-0.5"
                    checked={checked}
                    onCheckedChange={(next) => onToggle(credential.id, next === true)}
                    aria-label={credential.name}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm">{credential.name}</span>
                      <Badge variant="secondary" className="shrink-0">
                        {customAuthKindLabel(credential.kind)}
                      </Badge>
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      id {credential.id}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      ) : null}

      {status === "ready" ? (
        <p className="text-xs text-muted-foreground">
          Prefer saved credentials over pasting secrets.{" "}
          <Link
            to={CREATE_HREF}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create new…
          </Link>
        </p>
      ) : null}
    </section>
  )
}
