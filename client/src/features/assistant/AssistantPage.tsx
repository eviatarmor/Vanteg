import { useMemo, useState } from "react"
import { matchPath, useLocation, useNavigate } from "react-router"
import { Sparkles } from "lucide-react"

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"
import { useWorkflows } from "@/features/workflows/model/store"

import { buildAssistantContext, suggestionsForPath } from "./model/chat-context"
import { getAssistantSettings, isXaiAssistantModel } from "./model/settings"
import {
  createConversation,
  getConversation,
  useConversationStoreStatus,
  useConversations,
} from "./model/store"
import type {
  AssistantChatContext,
  AssistantConversation,
  AssistantStartPayload,
} from "./model/types"
import { AssistantComposer } from "./ui/AssistantComposer"
import { ChatThread } from "./ui/ChatThread"
import { ThreadHistory } from "./ui/ThreadHistory"
import {
  AssistantWelcome,
  assistantChatColumnClassName,
} from "./ui/AssistantWelcome"

type PendingStart = AssistantStartPayload & { id: string }

function snapshotStart(
  start?: string | AssistantStartPayload
): AssistantStartPayload | null {
  if (!start) {
    return null
  }
  const settings = getAssistantSettings()
  if (typeof start === "string") {
    return { text: start, ...settings }
  }
  return { ...settings, ...start }
}

function nextPending(
  conversationId: string,
  start?: string | AssistantStartPayload
): PendingStart | null {
  const payload = snapshotStart(start)
  if (!payload) {
    return null
  }
  return { id: conversationId, ...payload }
}

function pendingFor(
  pending: PendingStart | null,
  conversationId: string
): PendingStart | undefined {
  if (pending && pending.id === conversationId) {
    return pending
  }
  return undefined
}

function selectedConversation(threadId: string | undefined) {
  if (!threadId) {
    return undefined
  }
  return getConversation(threadId)
}

function AssistantLoading() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
      role="status"
      aria-label="Loading conversation"
    >
      <Spinner className="size-5" />
      Loading conversation…
    </div>
  )
}

function AssistantEmpty({
  suggestions,
  onStart,
}: {
  suggestions: readonly string[]
  onStart: (start?: string | AssistantStartPayload) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent
          className={cn(
            assistantChatColumnClassName,
            "flex min-h-full flex-col gap-4 px-4 py-6"
          )}
        >
          <AssistantWelcome
            suggestions={suggestions}
            onSelect={(value) => {
              if (!isXaiAssistantModel(getAssistantSettings().model)) {
                return
              }
              onStart(value)
            }}
          />
        </ConversationContent>
      </Conversation>
      <div className={cn(assistantChatColumnClassName, "px-3 pt-2 pb-3")}>
        <AssistantComposer
          onSubmit={(message) => {
            const text = message.text.trim()
            if (!(text || message.files?.length)) {
              return
            }
            onStart({ text, files: message.files, ...getAssistantSettings() })
          }}
        />
      </div>
    </div>
  )
}

function AssistantMissingThread({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      icon={Sparkles}
      title="Conversation not found"
      description="This chat is missing or was deleted. Start a new one, or pick another from history."
      actionLabel="New chat"
      onCreate={onStart}
      className="min-h-0 flex-1"
    />
  )
}

function AssistantChatPane({
  status,
  selected,
  threadId,
  context,
  pending,
  suggestions,
  onStart,
  onInitialPromptConsumed,
}: {
  status: string
  selected: AssistantConversation | undefined
  threadId: string | undefined
  context: AssistantChatContext
  pending: PendingStart | null
  suggestions: readonly string[]
  onStart: (start?: string | AssistantStartPayload) => void
  onInitialPromptConsumed: () => void
}) {
  if (status === "loading" && !selected) {
    return <AssistantLoading />
  }
  if (selected) {
    const start = pendingFor(pending, selected.id)
    return (
      <ChatThread
        key={selected.id}
        conversation={selected}
        context={context}
        initialPrompt={start?.text}
        initialFiles={start?.files}
        initialModel={start?.model}
        initialAccess={start?.access}
        initialEffort={start?.effort}
        onInitialPromptConsumed={onInitialPromptConsumed}
      />
    )
  }
  if (threadId) {
    return <AssistantMissingThread onStart={() => onStart()} />
  }
  return <AssistantEmpty suggestions={suggestions} onStart={onStart} />
}

export function AssistantPage() {
  useWorkflows()
  const { title, subtitle } = getPageCopy("/assistant")
  const location = useLocation()
  const navigate = useNavigate()
  const status = useConversationStoreStatus()
  useConversations()
  const threadId = matchPath("/assistant/:threadId", location.pathname)?.params
    .threadId
  const selected = selectedConversation(threadId)
  const context = useMemo(
    () => buildAssistantContext(location.pathname),
    [location.pathname]
  )
  const suggestions = suggestionsForPath("/")
  const [pending, setPending] = useState<PendingStart | null>(null)

  function startNew(start?: string | AssistantStartPayload) {
    const conversation = createConversation()
    setPending(nextPending(conversation.id, start))
    navigate(`/assistant/${conversation.id}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} subtitle={subtitle} icon={Sparkles} />
      <div className="flex min-h-0 flex-1">
        <ResizableSidebar
          id="assistant-history"
          defaultWidth={280}
          minWidth={220}
          maxRatio={0.4}
          sidebar={
            <ThreadHistory
              selectedId={selected?.id}
              onCreate={() => startNew()}
            />
          }
          sidebarClassName="bg-card [--scroll-fade-from:var(--card)]"
        >
          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background"
            aria-label="Assistant chat"
          >
            <AssistantChatPane
              status={status}
              selected={selected}
              threadId={threadId}
              context={context}
              pending={pending}
              suggestions={suggestions}
              onStart={startNew}
              onInitialPromptConsumed={() => setPending(null)}
            />
          </section>
        </ResizableSidebar>
      </div>
    </div>
  )
}
