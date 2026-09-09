import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Sparkles } from "lucide-react"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
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

import { suggestionsForPath } from "../model/chat-context"
import { getConversation, saveConversation, titleFromMessages } from "../model/store"
import type {
  AssistantChatContext,
  AssistantConversation,
  AssistantMessage,
} from "../model/types"

function toUIMessages(messages: AssistantMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }))
}

function fromUIMessages(messages: UIMessage[]): AssistantMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === "user" ? "user" : "assistant",
    content: message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join(""),
  }))
}

function persist(conversationId: string, messages: UIMessage[]) {
  const stored = fromUIMessages(messages)
  const current = getConversation(conversationId)
  const patch: { messages: AssistantMessage[]; title?: string } = { messages: stored }
  if (!current?.titleLocked) {
    patch.title = titleFromMessages(stored)
  }
  saveConversation(conversationId, patch)
}

export function ChatThread({
  conversation,
  context,
  initialPrompt,
  onInitialPromptConsumed,
}: {
  conversation: AssistantConversation
  context: AssistantChatContext
  initialPrompt?: string
  onInitialPromptConsumed?: () => void
}) {
  const [input, setInput] = useState("")
  const suggestions = suggestionsForPath(context.path)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context },
      }),
    [context]
  )
  const { messages, sendMessage, status, stop } = useChat({
    id: conversation.id,
    messages: toUIMessages(conversation.messages),
    transport,
    onFinish: ({ messages: next }) => persist(conversation.id, next),
  })

  const busy = status === "submitted" || status === "streaming"
  const sentInitial = useRef(false)

  async function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) {
      return
    }
    setInput("")
    await sendMessage({ text: trimmed })
  }

  useEffect(() => {
    if (!initialPrompt || sentInitial.current) {
      return
    }
    sentInitial.current = true
    onInitialPromptConsumed?.()
    void sendMessage({ text: initialPrompt })
  }, [initialPrompt, sendMessage, onInitialPromptConsumed])

  function onSubmit(message: PromptInputMessage) {
    void submit(message.text)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent className="gap-4 p-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              className="p-2"
              icon={<Sparkles className="size-8" />}
              title="Ask Vanteg"
              description="Start a conversation, or pick a prompt below."
            >
              <div className="flex w-full flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={(value) => void submit(value)}
                    className="h-auto w-full justify-start whitespace-normal rounded-lg py-2"
                  />
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message, index) => (
              <Message
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <MessageContent>
                  {message.parts.map((part, partIndex) =>
                    part.type === "text" ? (
                      <MessageResponse
                        key={`${message.id}-${partIndex}`}
                        isAnimating={
                          busy &&
                          index === messages.length - 1 &&
                          message.role !== "user"
                        }
                      >
                        {part.text}
                      </MessageResponse>
                    ) : null
                  )}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t border-border p-3">
        <PromptInput onSubmit={onSubmit}>
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
            <PromptInputSubmit
              status={status}
              disabled={!busy && input.trim() === ""}
              onStop={stop}
              aria-label="Send"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
