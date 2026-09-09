import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { SecretInput } from "@/components/secret-input"
import { getOAuthApp } from "@infra/integrations/oauth-apps"

import {
  connectActionLabel,
  credentialFieldsFor,
  isManagedOAuth,
} from "../model/credential-fields"
import { connectConnector, startManagedOAuthConnect } from "../model/store"
import type { Connector } from "../model/types"
import { BrandIcon } from "./BrandIcon"

export function ConnectConnectorDialog({
  connector,
  open,
  onOpenChange,
  onConnected,
}: {
  connector: Connector | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected?: () => void
}) {
  const navigate = useNavigate()
  const [values, setValues] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  if (!connector) {
    return null
  }

  const fields = credentialFieldsFor(connector)
  const managed = isManagedOAuth(connector)
  const actionLabel = connectActionLabel(connector)

  async function submit() {
    if (!connector || pending) {
      return
    }
    setPending(true)
    setFieldErrors({})
    try {
      if (managed) {
        const started = await startManagedOAuthConnect(connector.id)
        if (!started.ok) {
          toast.error(started.error.message)
          return
        }
        setValues({})
        setFieldErrors({})
        onOpenChange(false)
        navigate(started.data.authorizeUrl)
        return
      }

      const result = await connectConnector(connector.id, values)
      if (!result.ok) {
        if (result.error.fields) {
          setFieldErrors(result.error.fields)
        }
        toast.error(result.error.message)
        return
      }
      setValues({})
      setFieldErrors({})
      onOpenChange(false)
      onConnected?.()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) {
          return
        }
        if (!next) {
          setValues({})
          setFieldErrors({})
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrandIcon slug={connector.iconSlug} name={connector.name} />
            Connect {connector.name}
          </DialogTitle>
          <DialogDescription>
            {managed
              ? `Vanteg uses its own ${getOAuthApp(connector.auth.oauthAppId ?? "")?.name ?? "OAuth"} app. You only sign in — no client ID or secret.`
              : `Save ${connector.name} credentials to use this app from workflow steps.`}
          </DialogDescription>
        </DialogHeader>
        {managed ? (
          <p className="text-sm text-muted-foreground">{connector.description}</p>
        ) : (
          <div className="grid gap-3">
            {fields.map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={`credential-${field.id}`}>{field.label}</Label>
                {field.secret ? (
                  <SecretInput
                    id={`credential-${field.id}`}
                    value={values[field.id] ?? ""}
                    placeholder={field.placeholder}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors[field.id])}
                    disabled={pending}
                    onValueChange={(value) =>
                      setValues((current) => ({ ...current, [field.id]: value }))
                    }
                  />
                ) : (
                  <Input
                    id={`credential-${field.id}`}
                    type="text"
                    value={values[field.id] ?? ""}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors[field.id])}
                    disabled={pending}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                )}
                {fieldErrors[field.id] ? (
                  <p className="text-xs text-destructive">{fieldErrors[field.id]}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={pending} onClick={() => void submit()}>
            {pending ? (managed ? "Redirecting…" : "Connecting…") : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
