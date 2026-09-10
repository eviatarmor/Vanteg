import { useState } from "react"
import type { ChatStatus } from "ai"
import { XIcon } from "lucide-react"

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@/components/ai-elements/queue"

import { AgentModelSelect } from "@/features/agents/ui/AgentModelSelect"
import { getAgentModel, type AgentModel } from "@/features/agents/model/types"

function PromptAttachments() {
  const attachments = usePromptInputAttachments()
  if (attachments.files.length === 0) {
    return null
  }
  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

export function AssistantComposer({
  status = "ready",
  onSubmit,
  onStop,
  queued,
  onRemoveQueued,
  model,
  onModelChange,
}: {
  status?: ChatStatus
  onSubmit: (message: PromptInputMessage, model: AgentModel) => void
  onStop?: () => void
  queued?: readonly string[]
  onRemoveQueued?: (index: number) => void
  model?: AgentModel
  onModelChange?: (model: AgentModel) => void
}) {
  const [input, setInput] = useState("")
  const [localModel, setLocalModel] = useState<AgentModel>(
    getAgentModel("not-a-real-model").value
  )
  const selected = model ?? localModel
  const setSelected = onModelChange ?? setLocalModel
  const busy = status === "submitted" || status === "streaming"
  const queueItems = queued ?? []

  function handleSubmit(message: PromptInputMessage) {
    const hasText = Boolean(message.text.trim())
    const hasFiles = Boolean(message.files?.length)
    if (!(hasText || hasFiles)) {
      return
    }
    setInput("")
    onSubmit(message, selected)
  }

  return (
    <div className="border-t border-border p-3">
      <Queue aria-label="Message queue" role="region" className="mb-2">
        <QueueSection defaultOpen={queueItems.length > 0}>
          <QueueSectionTrigger>
            <QueueSectionLabel label="Queue" count={queueItems.length} />
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              {queueItems.length === 0 ? (
                <QueueItem>
                  <QueueItemIndicator />
                  <QueueItemContent>No messages queued</QueueItemContent>
                </QueueItem>
              ) : (
                queueItems.map((item, index) => (
                  <QueueItem key={`${item}-${index}`}>
                    <QueueItemIndicator />
                    <QueueItemContent>{item}</QueueItemContent>
                    <QueueItemActions>
                      <QueueItemAction
                        aria-label={`Remove queued message ${index + 1}`}
                        onClick={() => onRemoveQueued?.(index)}
                      >
                        <XIcon />
                      </QueueItemAction>
                    </QueueItemActions>
                  </QueueItem>
                ))
              )}
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
      <PromptInput onSubmit={handleSubmit} multiple>
        <PromptInputHeader>
          <PromptAttachments />
        </PromptInputHeader>
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
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger aria-label="Add attachments" />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <AgentModelSelect compact value={selected} onChange={setSelected} />
          </PromptInputTools>
          <PromptInputSubmit
            status={status}
            disabled={!busy && input.trim() === ""}
            onStop={onStop}
            aria-label="Send"
          />
        </PromptInputFooter>
      </PromptInput>
      <p className="sr-only">Using {getAgentModel(selected).label}</p>
    </div>
  )
}
