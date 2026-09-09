import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
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
import { Spinner } from "@workspace/ui/components/spinner"

import type { PageTab } from "@/features/page-tabs/types"

import { API_KEY_SCOPES } from "../model/scopes"
import { createApiKey } from "../model/store"
import type { ApiKeyKind } from "../model/types"

import { ApiKeySecretReveal } from "./ApiKeySecretReveal"

export function CreateApiKeyDialog({
  tab,
  open,
  onOpenChange,
}: {
  tab: PageTab | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [scopes, setScopes] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [secretOnce, setSecretOnce] = useState<string | null>(null)

  const kind = (tab?.id ?? "private-keys") as ApiKeyKind
  const title = tab?.newAction.label ?? "New API key"
  const placeholder = tab?.newAction.placeholder ?? "Key name"

  function resetForm() {
    setName("")
    setScopes([])
    setPending(false)
    setSecretOnce(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm()
    }
    onOpenChange(next)
  }

  function toggleScope(id: string) {
    setScopes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (secretOnce) {
      handleOpenChange(false)
      return
    }
    const trimmed = name.trim()
    if (!trimmed || !tab) return

    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 180))
      const created = createApiKey({ kind, name: trimmed, scopes })
      setSecretOnce(created.secret)
      toast.success(`Created ${created.key.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create key")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {secretOnce
                ? "Save the secret now — it will not be shown again."
                : "Name the key and optionally pick scopes. The secret is generated for you."}
            </DialogDescription>
          </DialogHeader>

          {secretOnce ? (
            <ApiKeySecretReveal secret={secretOnce} />
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="new-item-name">Name</Label>
                <Input
                  id="new-item-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={placeholder}
                  autoComplete="off"
                  disabled={pending}
                />
              </div>
              <div className="grid gap-2">
                <Label>Scopes (optional)</Label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Scopes">
                  {API_KEY_SCOPES.map((scope) => {
                    const selected = scopes.includes(scope.id)
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        disabled={pending}
                        onClick={() => toggleScope(scope.id)}
                        className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        aria-pressed={selected}
                      >
                        <Badge variant={selected ? "default" : "outline"}>
                          {scope.label}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              {secretOnce ? "Done" : "Cancel"}
            </Button>
            {!secretOnce ? (
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Creating…
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            ) : (
              <Button type="submit">Close</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
