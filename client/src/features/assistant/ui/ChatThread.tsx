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
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Suggestion } from "@/components/ai-elements/suggestion"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"

import { getAgentModel, type AgentModel } from "@/features/agents/model/types"

import { suggestionsForPath } from "../model/chat-context"
import {
  getConversation,
  saveConversation,
  titleFromMessages,
} from "../model/store"
import type {
  AssistantChatContext,
  AssistantConversation,
  AssistantMessage,
  AssistantStartFile,
} from "../model/types"
import { AssistantComposer } from "./AssistantComposer"
import {
  AssistantMessageParts,
  type AssistantRenderPart,
} from "./AssistantMessageParts"

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
  const patch: { messages: AssistantMessage[]; title?: string } = {
    messages: stored,
  }
  if (!current?.titleLocked) {
    patch.title = titleFromMessages(stored)
  }
  saveConversation(conversationId, patch)
}

export function partsFromUIMessage(message: UIMessage): AssistantRenderPart[] {
  const parts: AssistantRenderPart[] = []
  const sources: { href: string; title: string }[] = []
  for (const part of message.parts) {
    if (part.type === "text") {
      parts.push({ type: "text", text: part.text })
      continue
    }
    if (part.type === "reasoning") {
      parts.push({ type: "reasoning", text: part.text })
      continue
    }
    if (part.type === "source-url") {
      sources.push({ href: part.url, title: part.title ?? part.url })
      continue
    }
    if (part.type === "dynamic-tool") {
      parts.push({
        type: "tool",
        name: part.toolName,
        state: part.state,
        input: part.input,
        output: part.output,
        errorText: part.errorText,
      })
      continue
    }
    if (part.type.startsWith("tool-")) {
      const tool = part as Extract<
        UIMessage["parts"][number],
        { type: `tool-${string}` }
      >
      parts.push({
        type: "tool",
        name: part.type.slice("tool-".length),
        state: tool.state,
        input: "input" in tool ? tool.input : undefined,
        output: "output" in tool ? tool.output : undefined,
        errorText: "errorText" in tool ? tool.errorText : undefined,
      })
    }
  }
  if (sources.length > 0) {
    parts.push({ type: "sources", sources })
  }
  return parts
}

export function ChatThread({
  conversation,
  context,
  initialPrompt,
  initialFiles,
  initialModel,
  onInitialPromptConsumed,
}: {
  conversation: AssistantConversation
  context: AssistantChatContext
  initialPrompt?: string
  initialFiles?: AssistantStartFile[]
  initialModel?: AgentModel
  onInitialPromptConsumed?: () => void
}) {
  const [model, setModel] = useState<AgentModel>(
    initialModel ?? getAgentModel("not-a-real-model").value
  )
  const [queued, setQueued] = useState<string[]>([])
  const suggestions = suggestionsForPath(context.path)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context, model },
      }),
    [context, model]
  )
  const { messages, sendMessage, status, stop } = useChat({
    id: conversation.id,
    messages: toUIMessages(conversation.messages),
    transport,
    onFinish: ({ messages: next }) => persist(conversation.id, next),
  })

  const busy = status === "submitted" || status === "streaming"
  const sentInitial = useRef(false)

  async function submit(text: string, files?: PromptInputMessage["files"]) {
    const trimmed = text.trim()
    if ((!trimmed && !files?.length) || busy) {
      if (trimmed && busy) {
        setQueued((current) => [...current, trimmed])
      }
      return
    }
    await sendMessage({ text: trimmed || "Sent with attachments", files })
  }

  useEffect(() => {
    if (!busy && queued.length > 0) {
      const [next, ...rest] = queued
      setQueued(rest)
      if (next) {
        void sendMessage({ text: next })
      }
    }
  }, [busy, queued, sendMessage])

  useEffect(() => {
    const hasText = Boolean(initialPrompt?.trim())
    const hasFiles = Boolean(initialFiles?.length)
    if ((!hasText && !hasFiles) || sentInitial.current) {
      return
    }
    sentInitial.current = true
    onInitialPromptConsumed?.()
    void sendMessage({
      text: initialPrompt?.trim() || "Sent with attachments",
      files: initialFiles,
    })
  }, [initialPrompt, initialFiles, sendMessage, onInitialPromptConsumed])

  function onSubmit(message: PromptInputMessage) {
    void submit(message.text, message.files)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent className="gap-4 p-3">
          {messages.length === 0 ? (
            <>
              <ConversationEmptyState
                className="p-2"
                icon={<Sparkles className="size-8" />}
                title="Ask Vanteg"
                description="Start a conversation, or pick a prompt below."
              />
              <Shimmer>Ready when you are</Shimmer>
              <div className="flex w-full flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={(value) => void submit(value)}
                    className="h-auto w-full justify-start rounded-lg py-2 whitespace-normal"
                  />
                ))}
              </div>
            </>
          ) : (
            messages.map((message, index) => (
              <Message
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <MessageContent>
                  <AssistantMessageParts parts={partsFromUIMessage(message)} />
                  {busy &&
                  index === messages.length - 1 &&
                  message.role !== "user" &&
                  message.parts.every(
                    (part) => part.type !== "text" || part.text === ""
                  ) ? (
                    <Shimmer>Thinking</Shimmer>
                  ) : null}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <AssistantComposer
        status={status}
        onSubmit={onSubmit}
        onStop={stop}
        queued={queued}
        onRemoveQueued={(index) =>
          setQueued((current) => current.filter((_, item) => item !== index))
        }
        model={model}
        onModelChange={setModel}
      />
    </div>
  )
}
