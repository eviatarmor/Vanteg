import { useMemo, useState } from "react"
import { History, Maximize2, Plus, X } from "lucide-react"
import { Link, useLocation } from "react-router"

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation"
import { Button } from "@workspace/ui/components/button"
import { ScrollFade } from "@workspace/ui/components/scroll-fade"
import { cn } from "@workspace/ui/lib/utils"

import { useWorkflows } from "@/features/workflows/model/store"

import {
  buildAssistantContext,
  suggestionsForPath,
} from "../model/chat-context"
import { setAssistantOpen } from "../model/open-store"
import { getAssistantSettings, isXaiAssistantModel } from "../model/settings"

import type { AssistantStartPayload } from "../model/types"
import { createConversation, useConversations } from "../model/store"
import { AssistantComposer } from "./AssistantComposer"
import { ChatThread } from "./ChatThread"
import {
  AssistantWelcome,
  assistantChatColumnClassName,
} from "./AssistantWelcome"

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

export function AssistantPanel() {
  useWorkflows()
  const location = useLocation()
  const conversations = useConversations()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [view, setView] = useState<"chat" | "history">("chat")
  const [pending, setPending] = useState<AssistantStartPayload | null>(null)
  const active = conversations.find(
    (conversation) => conversation.id === activeId
  )
  const context = useMemo(
    () => buildAssistantContext(location.pathname),
    [location.pathname]
  )
  const suggestions = suggestionsForPath(location.pathname)

  function startNew(start?: string | AssistantStartPayload) {
    const conversation = createConversation()
    setActiveId(conversation.id)
    setPending(snapshotStart(start))
    setView("chat")
  }

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col bg-transparent"
      aria-label="Assistant"
    >
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">Assistant</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => startNew()}
        >
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
                    setPending(null)
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
          compact
          conversation={active}
          context={context}
          initialPrompt={pending?.text}
          initialFiles={pending?.files}
          initialModel={pending?.model}
          initialAccess={pending?.access}
          initialEffort={pending?.effort}
          onInitialPromptConsumed={() => setPending(null)}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <Conversation className="min-h-0">
            <ConversationContent
              className={cn(
                assistantChatColumnClassName,
                "flex min-h-full flex-col gap-4 px-3 py-6"
              )}
            >
              <AssistantWelcome
                suggestions={suggestions}
                onSelect={(value) => {
                  if (!isXaiAssistantModel(getAssistantSettings().model)) {
                    return
                  }
                  startNew(value)
                }}
              />
            </ConversationContent>
          </Conversation>
          <div className={cn(assistantChatColumnClassName, "px-2 pt-1.5 pb-2")}>
            <AssistantComposer
              compact
              onSubmit={(message) => {
                const text = message.text.trim()
                if (!(text || message.files?.length)) {
                  return
                }
                startNew({
                  text,
                  files: message.files,
                  ...getAssistantSettings(),
                })
              }}
            />
          </div>
        </div>
      )}
    </aside>
  )
}
