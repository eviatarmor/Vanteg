import { useMemo, useState } from "react"
import { History, Maximize2, Plus, Sparkles, X } from "lucide-react"
import { Link, useLocation } from "react-router"

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
import { Button } from "@workspace/ui/components/button"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"

import { useWorkflows } from "@/features/workflows/model/store"

import { buildAssistantContext, suggestionsForPath } from "../model/chat-context"
import { setAssistantOpen } from "../model/open-store"
import { createConversation, useConversations } from "../model/store"
import { ChatThread } from "./ChatThread"

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

export function AssistantPanel() {
  useWorkflows()
  const location = useLocation()
  const conversations = useConversations()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [view, setView] = useState<"chat" | "history">("chat")
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const active = conversations.find((conversation) => conversation.id === activeId)
  const context = useMemo(
    () => buildAssistantContext(location.pathname),
    [location.pathname]
  )
  const suggestions = suggestionsForPath(location.pathname)

  function startNew(prompt?: string) {
    const conversation = createConversation()
    setActiveId(conversation.id)
    setPendingPrompt(prompt ?? null)
    setView("chat")
  }

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col bg-transparent"
      aria-label="Assistant"
    >
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">Assistant</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => startNew()}>
          <Plus />
          New
        </Button>
        <Button
          type="button"
          variant={view === "history" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setView(view === "history" ? "chat" : "history")}
        >
          <History />
          History
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" asChild>
          <Link
            to={activeId ? `/assistant/${activeId}` : "/assistant"}
            aria-label="Open full"
            onClick={() => setAssistantOpen(false)}
          >
            <Maximize2 />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close assistant"
          onClick={() => setAssistantOpen(false)}
        >
          <X />
        </Button>
      </div>
      {view === "history" ? (
        <ScrollFade className="min-h-0 flex-1">
          <div className="flex flex-col gap-1 p-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No conversations yet.
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setActiveId(conversation.id)
                    setPendingPrompt(null)
                    setView("chat")
                  }}
                >
                  <p className="truncate font-medium">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.messages.length} message
                    {conversation.messages.length === 1 ? "" : "s"}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollFade>
      ) : active ? (
        <ChatThread
          key={active.id}
          conversation={active}
          context={context}
          initialPrompt={pendingPrompt ?? undefined}
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
    </aside>
  )
}
