import { useState } from "react"
import { toast } from "sonner"

import type { CustomCredential } from "@workspace/integrations"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { deleteCustomCredential } from "../model/store"

export function DeleteCustomCredentialDialog({
  credential,
  open,
  onOpenChange,
}: {
  credential: CustomCredential | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [pending, setPending] = useState(false)

  async function confirm() {
    if (!credential || pending) {
      return
    }
    setPending(true)
    try {
      const result = await deleteCustomCredential(credential.id)
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      toast.success("Credential deleted")
      onOpenChange(false)
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
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete credential</DialogTitle>
          <DialogDescription>
            Delete “{credential?.name ?? "this credential"}”? Agents and
            workflows that reference it will stop working until updated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void confirm()}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
