import { useMemo } from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import {
  filterMentionItems,
  groupedMentionItems,
  mentionItemValue,
} from "./mention-document"
import type { MentionItem, MentionKindMeta } from "./types"

export type MentionPickerProps = {
  items: MentionItem[]
  kinds: MentionKindMeta[]
  open: boolean
  search: string
  highlighted: string
  onHighlightedChange: (value: string) => void
  onSelect: (item: MentionItem) => void
  onOpenChange: (open: boolean) => void
}

export function mentionOptionId(item: Pick<MentionItem, "kind" | "id">): string {
  return `mention-option-${mentionItemValue(item)}`
}

export function MentionPicker({
  items,
  kinds,
  open,
  search,
  highlighted,
  onHighlightedChange,
  onSelect,
  onOpenChange,
}: MentionPickerProps) {
  const groups = useMemo(() => {
    const filtered = filterMentionItems(items, search)
    return groupedMentionItems(filtered, kinds)
  }, [items, kinds, search])

  const kindsByKind = useMemo(() => {
    return new Map(kinds.map((kind) => [kind.kind, kind]))
  }, [kinds])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <span className="pointer-events-none absolute size-0" aria-hidden />
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-64 max-w-[min(16rem,calc(100vw-2rem))] p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command
          shouldFilter={false}
          label="Mentions"
          value={highlighted}
          onValueChange={onHighlightedChange}
          className="rounded-lg"
        >
          <CommandList
            id="mention-picker-list"
            label="Mentions"
            className="max-h-48"
          >
            <CommandEmpty>No mentions found.</CommandEmpty>
            {groups.map((group) => {
              const Icon = group.icon
              return (
                <CommandGroup
                  key={group.kind}
                  heading={
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="size-3.5" aria-hidden />
                      <span>{group.label}</span>
                    </span>
                  }
                >
                  {group.items.map((item) => {
                    const kind = kindsByKind.get(item.kind) ?? group
                    const ItemIcon = kind.icon
                    const value = mentionItemValue(item)
                    return (
                      <CommandItem
                        key={value}
                        id={mentionOptionId(item)}
                        value={value}
                        aria-label={item.label}
                        onSelect={() => {
                          onSelect(item)
                          onOpenChange(false)
                        }}
                      >
                        <ItemIcon
                          className={cn("size-4 text-muted-foreground")}
                          aria-hidden
                        />
                        <span className="truncate">{item.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
