import { X } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import type { MentionItem, MentionKindMeta } from "./types"

export function MentionChip({
  item,
  kind,
  uid,
  onRemove,
}: {
  item: MentionItem
  kind: MentionKindMeta
  uid: string
  onRemove?: () => void
}) {
  const Icon = kind.icon
  return (
    <span
      contentEditable={false}
      data-mention-uid={uid}
      data-mention-kind={item.kind}
      data-mention-id={item.id}
      data-mention-label={item.label}
      data-segment-index=""
      className="mx-0.5 inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/60 py-0.5 pr-1 pl-2 align-middle text-xs text-foreground"
    >
      <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
      <span className="truncate">{item.label}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${item.label}`}
          className={cn(
            "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
          )}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove()
          }}
        >
          <X className="size-3" aria-hidden />
        </button>
      ) : null}
    </span>
  )
}
