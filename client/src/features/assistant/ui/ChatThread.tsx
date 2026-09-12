import { useEffect, useMemo, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai"

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { cn } from "@workspace/ui/lib/utils"

import type { AgentModel } from "@/features/agents/model/types"

import { suggestionsForPath } from "../model/chat-context"
import {
  getAssistantSettings,
  isXaiAssistantModel,
  type AssistantAccessMode,
  type AssistantEffort,
} from "../model/settings"
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
import {
  AssistantWelcome,
  assistantChatColumnClassName,
} from "./AssistantWelcome"

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

function toFileUIParts(
  files: AssistantStartFile[] | undefined
): FileUIPart[] | undefined {
  if (!files?.length) {
    return undefined
  }
  return files.map((file) => ({
    type: "file",
    url: file.url,
    mediaType: file.mediaType ?? "application/octet-stream",
    filename: file.filename,
  }))
}

function snapshotBody(overrides?: {
  model?: AgentModel
  access?: AssistantAccessMode
  effort?: AssistantEffort
}) {
  const current = getAssistantSettings()
  return {
    model: overrides?.model ?? current.model,
    access: overrides?.access ?? current.access,
    effort: overrides?.effort ?? current.effort,
  }
}

function partsFromUIMessage(message: UIMessage): AssistantRenderPart[] {
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
  initialAccess,
  initialEffort,
  onInitialPromptConsumed,
  compact = false,
}: {
  conversation: AssistantConversation
  context: AssistantChatContext
  initialPrompt?: string
  initialFiles?: AssistantStartFile[]
  initialModel?: AgentModel
  initialAccess?: AssistantAccessMode
  initialEffort?: AssistantEffort
  onInitialPromptConsumed?: () => void
  compact?: boolean
}) {
  const suggestions = suggestionsForPath(context.path)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context },
      }),
    [context]
  )
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    id: conversation.id,
    messages: toUIMessages(conversation.messages),
    transport,
    onFinish: ({ messages: next }) => persist(conversation.id, next),
  })

  const busy = status === "submitted" || status === "streaming"
  const sentInitial = useRef(false)

  async function submit(text: string, files?: PromptInputMessage["files"]) {
    const trimmed = text.trim()
    const snapshot = snapshotBody()
    if (
      (!trimmed && !files?.length) ||
      busy ||
      !isXaiAssistantModel(snapshot.model)
    ) {
      return
    }
    await sendMessage(
      { text: trimmed || "Sent with attachments", files },
      { body: snapshot }
    )
  }

  useEffect(() => {
    const hasText = Boolean(initialPrompt?.trim())
    const hasFiles = Boolean(initialFiles?.length)
    if ((!hasText && !hasFiles) || sentInitial.current) {
      return
    }
    sentInitial.current = true
    onInitialPromptConsumed?.()
    const body = snapshotBody({
      model: initialModel,
      access: initialAccess,
      effort: initialEffort,
    })
    if (!isXaiAssistantModel(body.model)) {
      return
    }
    void sendMessage(
      {
        text: initialPrompt?.trim() || "Sent with attachments",
        files: toFileUIParts(initialFiles),
      },
      { body }
    )
  }, [
    initialPrompt,
    initialFiles,
    initialModel,
    initialAccess,
    initialEffort,
    sendMessage,
    onInitialPromptConsumed,
  ])

  function onSubmit(message: PromptInputMessage) {
    void submit(message.text, message.files)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent
          className={cn(
            assistantChatColumnClassName,
            "flex min-h-full flex-col gap-4 px-4 py-6"
          )}
        >
          {messages.length === 0 ? (
            <AssistantWelcome
              suggestions={suggestions}
              onSelect={(value) => void submit(value)}
            />
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
      <div
        className={cn(
          assistantChatColumnClassName,
          compact ? "px-2 pt-1.5 pb-2" : "px-3 pt-2 pb-3"
        )}
      >
        <AssistantComposer
          compact={compact}
          status={status}
          onSubmit={onSubmit}
          onStop={stop}
          error={error}
          onRetry={() => void regenerate({ body: snapshotBody() })}
        />
      </div>
    </div>
  )
}
