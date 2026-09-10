import { useMemo, useState } from "react"
import { matchPath, useLocation, useNavigate } from "react-router"
import { Sparkles } from "lucide-react"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Suggestion } from "@/components/ai-elements/suggestion"
import { Spinner } from "@workspace/ui/components/spinner"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"
import { useWorkflows } from "@/features/workflows/model/store"

import { buildAssistantContext, suggestionsForPath } from "./model/chat-context"
import {
  createConversation,
  getConversation,
  useConversationStoreStatus,
  useConversations,
} from "./model/store"
import type { AssistantChatContext, AssistantConversation } from "./model/types"
import { ChatThread } from "./ui/ChatThread"
import { ThreadHistory } from "./ui/ThreadHistory"

function EmptyComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [input, setInput] = useState("")

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim()
    if (!text) {
      return
    }
    setInput("")
    onSubmit(text)
  }

  return (
    <div className="border-t border-border p-3">
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Ask Vanteg…"
            aria-label="Message"
            className="min-h-11"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit disabled={input.trim() === ""} aria-label="Send" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}

function nextPending(
  conversationId: string,
  prompt?: string
): { id: string; prompt: string } | null {
  if (!prompt) {
    return null
  }
  return { id: conversationId, prompt }
}

function pendingPromptFor(
  pending: { id: string; prompt: string } | null,
  conversationId: string
) {
  if (pending && pending.id === conversationId) {
    return pending.prompt
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
  onStart: (prompt?: string) => void
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
      <EmptyComposer onSubmit={(text) => onStart(text)} />
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
  pending: { id: string; prompt: string } | null
  suggestions: readonly string[]
  onStart: (prompt?: string) => void
  onInitialPromptConsumed: () => void
}) {
  if (status === "loading" && !selected) {
    return <AssistantLoading />
  }
  if (selected) {
    return (
      <ChatThread
        key={selected.id}
        conversation={selected}
        context={context}
        initialPrompt={pendingPromptFor(pending, selected.id)}
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
  const [pending, setPending] = useState<{ id: string; prompt: string } | null>(
    null
  )

  function startNew(prompt?: string) {
    const conversation = createConversation()
    setPending(nextPending(conversation.id, prompt))
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
