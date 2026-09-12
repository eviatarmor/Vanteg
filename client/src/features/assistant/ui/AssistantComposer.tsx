import { useState, type FormEvent, type KeyboardEvent } from "react"
import type { ChatStatus } from "ai"
import { ChevronDown } from "lucide-react"

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
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  usePromptInputController,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { AgentModelSelect } from "@/features/agents/ui/AgentModelSelect"
import { getAgentModel } from "@/features/agents/model/types"

import {
  assistantAccessHint,
  assistantAccessOptions,
  assistantEffortOptions,
  assistantEffortTriggerLabel,
  assistantGrokOnlyHint,
  isXaiAssistantModel,
  setAssistantSettings,
  useAssistantSettings,
} from "../model/settings"

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

function ComposerChoiceMenu<T extends string>({
  label,
  value,
  options,
  compact,
  hint,
  triggerLabel,
  onChange,
  maxWidthClass,
}: {
  label: "Access" | "Effort"
  value: T
  options: readonly { value: T; label: string; description: string }[]
  compact: boolean
  hint?: string
  triggerLabel: string
  onChange: (value: T) => void
  maxWidthClass: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          aria-label={label}
          className={
            compact
              ? `h-7 ${maxWidthClass} justify-between gap-1 border border-border bg-card px-2 font-normal text-foreground shadow-none`
              : `h-8 ${maxWidthClass} justify-between gap-1 border border-border bg-card px-2 font-normal text-foreground shadow-none`
          }
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-auto min-w-48 max-w-[min(20rem,calc(100vw-2rem))]"
      >
        {hint ? (
          <p className="px-2 py-1.5 text-xs whitespace-normal text-muted-foreground">
            {hint}
          </p>
        ) : null}
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            onChange(next as T)
            setOpen(false)
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="items-start"
            >
              <span className="flex max-w-full flex-col items-start gap-0.5 text-left whitespace-normal">
                <span>{option.label}</span>
                <span className="text-xs font-normal whitespace-normal text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ComposerSubmit({
  status,
  busy,
  onStop,
  compact = false,
}: {
  status?: ChatStatus
  busy: boolean
  onStop?: () => void
  compact?: boolean
}) {
  const attachments = usePromptInputAttachments()
  const { textInput } = usePromptInputController()
  const empty = textInput.value.trim() === "" && attachments.files.length === 0
  const sendMuted = !busy && empty
  return (
    <PromptInputSubmit
      status={status}
      size={compact ? "icon-xs" : "icon-sm"}
      aria-disabled={sendMuted || undefined}
      className={sendMuted ? "opacity-50" : undefined}
      onStop={onStop}
      aria-label={busy ? "Stop" : "Send"}
      onClick={(event) => {
        if (sendMuted) {
          event.preventDefault()
        }
      }}
    />
  )
}

export function AssistantComposer({
  status = "ready",
  onSubmit,
  onStop,
  error,
  onRetry,
  compact = false,
}: {
  status?: ChatStatus
  onSubmit: (message: PromptInputMessage) => void
  onStop?: () => void
  error?: Error | null
  onRetry?: () => void
  compact?: boolean
}) {
  const settings = useAssistantSettings()
  const busy = status === "submitted" || status === "streaming"
  const selectedModel = getAgentModel(settings.model)
  const selectedAccess =
    assistantAccessOptions.find((option) => option.value === settings.access) ??
    assistantAccessOptions[1]!

  function handleSubmit(message: PromptInputMessage) {
    if (busy) {
      throw new Error("A reply is already in progress.")
    }
    const hasText = Boolean(message.text.trim())
    const hasFiles = Boolean(message.files?.length)
    if (!(hasText || hasFiles)) {
      return
    }
    onSubmit(message)
  }

  function interceptBusySubmit(event: FormEvent<HTMLDivElement>) {
    if (!busy) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
  }

  function interceptBusyEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (busy && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
    }
  }

  return (
    <PromptInputProvider>
      <div className={compact ? "flex flex-col gap-1.5" : "flex flex-col gap-2"}>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not complete that reply</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
            {onRetry ? (
              <div className="mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                >
                  Retry
                </Button>
              </div>
            ) : null}
          </Alert>
        ) : null}
        {busy ? (
          <p className="text-sm text-muted-foreground" role="status">
            {status === "submitted" ? "Sending…" : "Generating a reply…"} You
            can keep drafting; send is paused until this finishes or you stop
            it.
          </p>
        ) : null}
        <div
          onSubmitCapture={interceptBusySubmit}
          onResetCapture={(event) => {
            event.preventDefault()
          }}
        >
          <PromptInput
            onSubmit={handleSubmit}
            multiple
            className="[&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card"
          >
            <PromptInputHeader>
              <PromptAttachments />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onKeyDown={interceptBusyEnter}
                placeholder="Ask Vanteg…"
                aria-label="Message"
                className={compact ? "min-h-11 py-1.5" : "min-h-16"}
              />
            </PromptInputBody>
            <PromptInputFooter
              className={
                compact ? "flex-wrap gap-1 px-2 pb-1.5" : "flex-wrap gap-2"
              }
            >
              <PromptInputTools
                className={compact ? "flex-wrap gap-1" : "flex-wrap gap-1.5"}
              >
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger
                    aria-label="Add attachments"
                    size={compact ? "icon-xs" : "icon-sm"}
                  />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <AgentModelSelect
                  compact
                  size={compact ? "sm" : "default"}
                  value={settings.model}
                  isModelAvailable={isXaiAssistantModel}
                  unavailableHint={assistantGrokOnlyHint}
                  onChange={(model) => setAssistantSettings({ model })}
                />
                <ComposerChoiceMenu
                  label="Access"
                  value={settings.access}
                  options={assistantAccessOptions}
                  compact={compact}
                  hint={assistantAccessHint}
                  triggerLabel={selectedAccess.label}
                  maxWidthClass="max-w-[min(11rem,calc(100vw-4rem))]"
                  onChange={(access) => setAssistantSettings({ access })}
                />
                <ComposerChoiceMenu
                  label="Effort"
                  value={settings.effort}
                  options={assistantEffortOptions.map((option) => ({
                    ...option,
                    label: assistantEffortTriggerLabel(option.value),
                  }))}
                  compact={compact}
                  triggerLabel={assistantEffortTriggerLabel(settings.effort)}
                  maxWidthClass="max-w-[min(12rem,calc(100vw-4rem))]"
                  onChange={(effort) => setAssistantSettings({ effort })}
                />
              </PromptInputTools>
              <ComposerSubmit
                status={status}
                busy={busy}
                onStop={onStop}
                compact={compact}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
        <p className="sr-only">
          Using {selectedModel.label}, {selectedAccess.label},{" "}
          {assistantEffortTriggerLabel(settings.effort)}
        </p>
      </div>
    </PromptInputProvider>
  )
}
