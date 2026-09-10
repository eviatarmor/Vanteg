import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { MoreHorizontal, Plus, Sparkles, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/features/empty-state/EmptyState"

import { formatRelativeTime } from "../model/relative-time"
import {
  clearConversationStoreError,
  deleteConversation,
  renameConversation,
  retryConversationStore,
  useConversationSaveWarning,
  useConversationStoreError,
  useConversationStoreStatus,
  useConversations,
} from "../model/store"
import type { AssistantConversation } from "../model/types"

function ThreadRow({
  conversation,
  selected,
  onRequestDelete,
}: {
  conversation: AssistantConversation
  selected: boolean
  onRequestDelete: (conversation: AssistantConversation) => void
}) {
  const navigate = useNavigate()
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(conversation.title)

  function submitRename(event: FormEvent) {
    event.preventDefault()
    const next = renameConversation(conversation.id, title)
    if (next) {
      setRenaming(false)
    }
  }

  return (
    <div className={cn("group relative rounded-lg", selected && "bg-muted")}>
      {renaming ? (
        <form onSubmit={submitRename} className="flex flex-col gap-2 p-2">
          <Label htmlFor={`rename-${conversation.id}`} className="sr-only">
            Rename conversation
          </Label>
          <Input
            id={`rename-${conversation.id}`}
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            autoFocus
            aria-label="Conversation title"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setTitle(conversation.title)
                setRenaming(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Link
            to={`/assistant/${conversation.id}`}
            className={cn(
              "block min-w-0 rounded-lg px-3 py-2 pr-10 text-left text-sm hover:bg-muted/70",
              selected && "font-medium"
            )}
            aria-current={selected ? "page" : undefined}
          >
            <p className="truncate">{conversation.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(conversation.updatedAt)}
            </p>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1.5 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-open:opacity-100"
                aria-label={`Actions for ${conversation.title}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setTitle(conversation.title)
                  setRenaming(true)
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  if (conversation.messages.length === 0) {
                    deleteConversation(conversation.id)
                    if (selected) {
                      navigate("/assistant")
                    }
                    return
                  }
                  onRequestDelete(conversation)
                }}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}

function deleteConversationDescription(
  conversation: AssistantConversation | null
) {
  if (!conversation) {
    return null
  }
  const count = conversation.messages.length
  const plural = count === 1 ? "" : "s"
  return `“${conversation.title}” has ${count} message${plural}. This cannot be undone.`
}

function confirmPendingDelete(
  pendingDelete: AssistantConversation | null,
  selectedId: string | undefined,
  navigate: (path: string) => void,
  setPendingDelete: (value: AssistantConversation | null) => void
) {
  if (!pendingDelete) {
    return
  }
  const id = pendingDelete.id
  deleteConversation(id)
  setPendingDelete(null)
  if (selectedId === id) {
    navigate("/assistant")
  }
}

function closeDeleteDialog(
  open: boolean,
  setPendingDelete: (value: AssistantConversation | null) => void
) {
  if (open) {
    return
  }
  setPendingDelete(null)
}

function HistorySaveWarning({
  saveWarning,
  hasConversations,
}: {
  saveWarning: string | null
  hasConversations: boolean
}) {
  if (!saveWarning || !hasConversations) {
    return null
  }
  return (
    <div
      className="border-b border-border px-3 py-2 text-sm text-destructive"
      role="status"
    >
      {saveWarning}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="ml-2"
        onClick={() => retryConversationStore()}
      >
        Retry
      </Button>
    </div>
  )
}

function HistoryLoading() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-2 p-3"
      role="status"
      aria-label="Loading history"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading history…
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

function HistoryError({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm font-medium">Could not load history</p>
      <p className="text-sm text-muted-foreground">
        {error ?? "Something went wrong reading saved chats."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => retryConversationStore()}
        >
          Retry
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => clearConversationStoreError()}
        >
          Clear data
        </Button>
      </div>
    </div>
  )
}

function HistoryList({
  conversations,
  selectedId,
  onRequestDelete,
}: {
  conversations: AssistantConversation[]
  selectedId?: string
  onRequestDelete: (conversation: AssistantConversation) => void
}) {
  return (
    <ScrollFade className="min-h-0 flex-1">
      <nav aria-label="Conversations" className="flex flex-col gap-1 p-2">
        {conversations.map((conversation) => (
          <ThreadRow
            key={conversation.id}
            conversation={conversation}
            selected={selectedId === conversation.id}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </nav>
    </ScrollFade>
  )
}

function HistoryBody({
  status,
  error,
  conversations,
  selectedId,
  onCreate,
  onRequestDelete,
}: {
  status: string
  error: string | null
  conversations: AssistantConversation[]
  selectedId?: string
  onCreate: () => void
  onRequestDelete: (conversation: AssistantConversation) => void
}) {
  if (status === "loading") {
    return <HistoryLoading />
  }
  if (status === "error") {
    return <HistoryError error={error} />
  }
  if (conversations.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <EmptyState
          icon={Sparkles}
          title="No chats yet"
          description="Start a conversation with Vanteg. History is saved in this browser."
          actionLabel="New chat"
          onCreate={onCreate}
          className="min-h-0 flex-1"
        />
      </div>
    )
  }
  return (
    <HistoryList
      conversations={conversations}
      selectedId={selectedId}
      onRequestDelete={onRequestDelete}
    />
  )
}

function DeleteConversationDialog({
  pendingDelete,
  onOpenChange,
  onConfirm,
}: {
  pendingDelete: AssistantConversation | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={pendingDelete != null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete conversation?</DialogTitle>
          <DialogDescription>
            {deleteConversationDescription(pendingDelete)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ThreadHistory({
  selectedId,
  onCreate,
}: {
  selectedId?: string
  onCreate: () => void
}) {
  const conversations = useConversations()
  const status = useConversationStoreStatus()
  const error = useConversationStoreError()
  const saveWarning = useConversationSaveWarning()
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] =
    useState<AssistantConversation | null>(null)

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col"
      aria-label="Chat history"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">History</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCreate}>
          <Plus />
          New chat
        </Button>
      </div>

      <HistorySaveWarning
        saveWarning={saveWarning}
        hasConversations={conversations.length > 0}
      />
      <HistoryBody
        status={status}
        error={error}
        conversations={conversations}
        selectedId={selectedId}
        onCreate={onCreate}
        onRequestDelete={setPendingDelete}
      />

      <DeleteConversationDialog
        pendingDelete={pendingDelete}
        onOpenChange={(open) => closeDeleteDialog(open, setPendingDelete)}
        onConfirm={() =>
          confirmPendingDelete(
            pendingDelete,
            selectedId,
            navigate,
            setPendingDelete
          )
        }
      />
    </aside>
  )
}
