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

export function AssistantPage() {
  useWorkflows()
  const { title, subtitle } = getPageCopy("/assistant")
  const location = useLocation()
  const navigate = useNavigate()
  const status = useConversationStoreStatus()
  useConversations()
  const threadId = matchPath("/assistant/:threadId", location.pathname)?.params.threadId
  const selected = threadId ? getConversation(threadId) : undefined
  const context = useMemo(
    () => buildAssistantContext(location.pathname),
    [location.pathname]
  )
  const suggestions = suggestionsForPath("/")
  const [pending, setPending] = useState<{ id: string; prompt: string } | null>(null)

  function startNew(prompt?: string) {
    const conversation = createConversation()
    setPending(prompt ? { id: conversation.id, prompt } : null)
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
          sidebar={<ThreadHistory selectedId={selected?.id} onCreate={() => startNew()} />}
          sidebarClassName="bg-card [--scroll-fade-from:var(--card)]"
        >
          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background"
            aria-label="Assistant chat"
          >
            {status === "loading" && !selected ? (
              <div
                className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
                role="status"
                aria-label="Loading conversation"
              >
                <Spinner className="size-5" />
                Loading conversation…
              </div>
            ) : selected ? (
              <ChatThread
                key={selected.id}
                conversation={selected}
                context={context}
                initialPrompt={
                  pending && selected.id === pending.id ? pending.prompt : undefined
                }
              />
            ) : threadId ? (
              <EmptyState
                icon={Sparkles}
                title="Conversation not found"
                description="This chat is missing or was deleted. Start a new one, or pick another from history."
                actionLabel="New chat"
                onCreate={() => startNew()}
                className="min-h-0 flex-1"
              />
            ) : (
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
                          onClick={(value) => startNew(value)}
                          className="h-auto w-full justify-start whitespace-normal rounded-lg py-2"
                        />
                      ))}
                    </div>
                  </ConversationContent>
                </Conversation>
                <EmptyComposer onSubmit={(text) => startNew(text)} />
              </div>
            )}
          </section>
        </ResizableSidebar>
      </div>
    </div>
  )
}
