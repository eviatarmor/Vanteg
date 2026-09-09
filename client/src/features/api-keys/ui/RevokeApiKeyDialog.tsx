import { useState } from "react"
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
import { Spinner } from "@workspace/ui/components/spinner"

import { deleteApiKey, revokeApiKey } from "../model/store"
import type { ApiKey } from "../model/types"

export function RevokeApiKeyDialog({
  apiKey,
  open,
  onOpenChange,
}: {
  apiKey: ApiKey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [pending, setPending] = useState(false)

  async function confirmRevoke() {
    if (!apiKey) return
    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 120))
      if (apiKey.status === "revoked") {
        deleteApiKey(apiKey.id)
        toast.success(`Deleted ${apiKey.name}`)
      } else {
        revokeApiKey(apiKey.id)
        toast.success(`Revoked ${apiKey.name}`)
      }
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  const isDelete = apiKey?.status === "revoked"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isDelete ? "Delete API key" : "Revoke API key"}</DialogTitle>
          <DialogDescription>
            {isDelete
              ? `Permanently remove “${apiKey?.name ?? "this key"}”? This cannot be undone.`
              : `Revoke “${apiKey?.name ?? "this key"}”? Requests using this key will stop working.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmRevoke}
            disabled={pending || !apiKey}
          >
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                {isDelete ? "Deleting…" : "Revoking…"}
              </>
            ) : isDelete ? (
              "Delete"
            ) : (
              "Revoke"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
