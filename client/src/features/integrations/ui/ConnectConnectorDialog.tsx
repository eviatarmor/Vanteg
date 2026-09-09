import { useState } from "react"

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

import { getOAuthApp } from "@infra/integrations/oauth-apps"

import {
  connectActionLabel,
  credentialFieldsFor,
  isManagedOAuth,
} from "../model/credential-fields"
import { connectConnector } from "../model/store"
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
  const [values, setValues] = useState<Record<string, string>>({})

  if (!connector) {
    return null
  }

  const fields = credentialFieldsFor(connector)
  const managed = isManagedOAuth(connector)
  const actionLabel = connectActionLabel(connector)

  function submit() {
    if (!connector) {
      return
    }
    connectConnector(connector.id, values)
    setValues({})
    onOpenChange(false)
    onConnected?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setValues({})
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
                <Input
                  id={`credential-${field.id}`}
                  type={field.secret ? "password" : "text"}
                  value={values[field.id] ?? ""}
                  placeholder={field.placeholder}
                  autoComplete={field.secret ? "off" : "off"}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.id]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
