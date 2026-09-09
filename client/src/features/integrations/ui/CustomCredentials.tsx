import { KeyRound } from "lucide-react"

import {
  customAuthKindLabel,
  primarySecretPreview,
  type CustomCredential,
} from "@workspace/integrations"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/features/empty-state/EmptyState"

import { useIntegrationsStore } from "../model/store"

export function CustomCredentials({
  onCreate,
  onEdit,
  onDelete,
}: {
  onCreate: () => void
  onEdit: (credential: CustomCredential) => void
  onDelete: (credential: CustomCredential) => void
}) {
  const snapshot = useIntegrationsStore()
  const items = snapshot.customCredentials

  if (items.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        title="No custom credentials yet"
        description="Save reusable Bearer, API key, Basic, HMAC, or OAuth2 configs for agents and workflows."
        actionLabel="New credential"
        onCreate={onCreate}
        className="min-h-0 flex-1"
      />
    )
  }

  return (
    <div className="grid gap-2">
      {items.map((credential) => (
        <div
          key={credential.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{credential.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {primarySecretPreview(credential.kind, credential.fields) || "No secret"} · id{" "}
              {credential.id}
            </p>
          </div>
          <Badge variant="secondary">{customAuthKindLabel(credential.kind)}</Badge>
          <Button size="sm" variant="ghost" onClick={() => onEdit(credential)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(credential)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}
