import { useMemo, useState } from "react"
import { matchPath, useLocation, useNavigate } from "react-router"
import { Sparkles } from "lucide-react"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Suggestion } from "@/components/ai-elements/suggestion"
import { Spinner } from "@workspace/ui/components/spinner"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"
import { useWorkflows } from "@/features/workflows/model/store"

import { getAgentModel } from "@/features/agents/model/types"

import { buildAssistantContext, suggestionsForPath } from "./model/chat-context"
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

type PendingStart = AssistantStartPayload & { id: string }

function nextPending(
  conversationId: string,
  start?: string | AssistantStartPayload
): PendingStart | null {
  if (!start) {
    return null
  }
  if (typeof start === "string") {
    return {
      id: conversationId,
      text: start,
      model: getAgentModel("not-a-real-model").value,
    }
  }
  return { id: conversationId, ...start }
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
        <ConversationContent className="gap-4 p-3">
          <ConversationEmptyState
            className="min-h-40 p-2"
            icon={<Sparkles className="size-8" />}
            title="Ask Vanteg"
            description="Start a conversation, or pick a prompt."
          />
          <Shimmer>Ready when you are</Shimmer>
          <div className="flex w-full flex-col gap-2">
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                suggestion={suggestion}
                onClick={(value) => onStart(value)}
                className="h-auto w-full justify-start rounded-lg py-2 whitespace-normal"
              />
            ))}
          </div>
        </ConversationContent>
      </Conversation>
      <AssistantComposer
        onSubmit={(message, model) => {
          const text = message.text.trim()
          if (!(text || message.files?.length)) {
            return
          }
          onStart({ text, files: message.files, model })
        }}
      />
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
