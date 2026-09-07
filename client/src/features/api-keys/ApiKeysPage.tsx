import { useState, type FormEvent } from "react"
import { KeyRound, Plus } from "lucide-react"

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

import { EmptyState } from "@/features/empty-state/EmptyState"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

export function ApiKeysPage() {
  const { title, subtitle } = getPageCopy("/api-keys")
  const [promptOpen, setPromptOpen] = useState(false)
  const [name, setName] = useState("")

  function handleNew() {
    setName("")
    setPromptOpen(true)
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPromptOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button size="sm" onClick={handleNew}>
            <Plus />
            New API key
          </Button>
        }
      />
      <EmptyState
        icon={KeyRound}
        title="No API keys yet"
        description="API keys for calling Freeze from outside this workspace will appear here."
        actionLabel="New API key"
        onCreate={handleNew}
        className="min-h-0 flex-1"
      />
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <form onSubmit={submitPrompt} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>New API key</DialogTitle>
              <DialogDescription>
                Enter a name to create a new item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="new-api-key-name">Name</Label>
              <Input
                id="new-api-key-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Key name"
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPromptOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
