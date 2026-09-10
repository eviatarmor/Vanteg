import { Link } from "react-router"

import { customAuthKindLabel } from "@workspace/integrations"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { useIntegrationsStore } from "@/features/integrations/model/store"

import { CREDENTIAL_NONE, normalizeCredentialId } from "../model/types"

const CREATE_HREF = "/integrations?tab=custom-credentials"

export function CredentialPicker({
  id = "credential-picker",
  value,
  onChange,
  label = "Credential",
  help,
}: {
  id?: string
  value: string
  onChange: (credentialId: string) => void
  label?: string
  help?: string
}) {
  const { customCredentials } = useIntegrationsStore()
  const selectedId = normalizeCredentialId(value)
  const selected = customCredentials.find((item) => item.id === selectedId)
  const missing = Boolean(selectedId) && !selected

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {customCredentials.length === 0 && !missing ? (
        <div
          className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
          data-testid="credential-picker-empty"
        >
          No custom credentials yet. Save one under{" "}
          <Link
            to={CREATE_HREF}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Connectors → Custom Credentials
          </Link>{" "}
          and select it here instead of pasting secrets into the step.
        </div>
      ) : customCredentials.length > 0 ? (
        <Select
          value={selected ? selectedId : CREDENTIAL_NONE}
          onValueChange={(next) => {
            if (!next) {
              return
            }
            onChange(normalizeCredentialId(next))
          }}
        >
          <SelectTrigger id={id} className="w-full" aria-label={label}>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CREDENTIAL_NONE}>None</SelectItem>
            {customCredentials.map((credential) => (
              <SelectItem key={credential.id} value={credential.id}>
                <span className="inline-flex items-center gap-2">
                  <span className="truncate">{credential.name}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {customAuthKindLabel(credential.kind)}
                  </Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {missing ? (
        <div
          className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3"
          data-testid="credential-picker-missing"
        >
          <p className="text-sm text-muted-foreground">
            This credential is missing or was deleted.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange("")}>
            Clear
          </Button>
        </div>
      ) : selected ? (
        <p className="text-xs text-muted-foreground" data-testid="credential-picker-using">
          Using credential: <span className="font-medium text-foreground">{selected.name}</span>
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {help ?? "Prefer a saved custom credential over pasting secrets into this step."}{" "}
        <Link
          to={CREATE_HREF}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create new…
        </Link>
      </p>
    </div>
  )
}
