import { Link } from "react-router"

import { customAuthKindLabel } from "@workspace/integrations"
import { Badge } from "@workspace/ui/components/badge"
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

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {customCredentials.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
          data-testid="credential-picker-empty"
        >
          No custom credentials yet. Save one under{" "}
          <Link
            to={CREATE_HREF}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Integrations → Custom Credentials
          </Link>{" "}
          and select it here instead of pasting secrets into the step.
        </div>
      ) : (
        <Select
          value={selectedId || CREDENTIAL_NONE}
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
      )}
      {selected ? (
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
