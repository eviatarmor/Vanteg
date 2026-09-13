import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type KeyboardEventHandler,
} from "react"
import { nanoid } from "nanoid"

import { cn } from "@workspace/ui/lib/utils"

import {
  filterMentionItems,
  findMentionQueryInDocument,
  flattenGroupedMentionItems,
  insertMention,
  mentionItemValue,
  normalizeMentionDocument,
  removeMention,
  serializeMentionDocument,
} from "./mention-document"
import type { MentionQuery } from "./mention-query"
import { MentionChip } from "./MentionChip"
import { mentionOptionId, MentionPicker } from "./MentionPicker"
import type { MentionItem, MentionKindMeta, MentionSegment } from "./types"

const ZWSP = "\u200b"

export type MentionInputProps = {
  items: MentionItem[]
  kinds: MentionKindMeta[]
  segments: MentionSegment[]
  onSegmentsChange: (segments: MentionSegment[]) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  "aria-label"?: string
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
  onPasteFiles?: (files: File[]) => void
}

type Caret = { segmentIndex: number; offset: number }

function stripZwsp(value: string): string {
  return value.replaceAll(ZWSP, "")
}

function parseEditor(root: HTMLElement): MentionSegment[] {
  const segments: MentionSegment[] = []
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      segments.push({ type: "text", text: stripZwsp(node.textContent ?? "") })
      continue
    }
    if (!(node instanceof HTMLElement)) {
      continue
    }
    if (node.dataset.mentionText !== undefined) {
      segments.push({ type: "text", text: stripZwsp(node.textContent ?? "") })
      continue
    }
    if (node.dataset.mentionUid) {
      segments.push({
        type: "mention",
        uid: node.dataset.mentionUid,
        item: {
          kind: node.dataset.mentionKind ?? "",
          id: node.dataset.mentionId ?? "",
          label: node.dataset.mentionLabel ?? "",
        },
      })
    }
  }
  return normalizeMentionDocument(segments)
}

function caretFromSelection(root: HTMLElement): Caret | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return null
  }
  const node = selection.focusNode
  if (!node || !root.contains(node)) {
    return null
  }
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement
  if (!element) {
    return null
  }
  const textSpan = element.closest("[data-mention-text]")
  if (textSpan instanceof HTMLElement && root.contains(textSpan)) {
    const index = Number(textSpan.dataset.segmentIndex)
    if (!Number.isFinite(index)) {
      return null
    }
    let offset = selection.focusOffset
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ""
      if (text.startsWith(ZWSP)) {
        offset = Math.max(0, offset - 1)
      }
    }
    return { segmentIndex: index, offset }
  }
  const chip = element.closest("[data-mention-uid]")
  if (chip instanceof HTMLElement && root.contains(chip)) {
    const children = Array.from(root.children)
    const chipIndex = children.indexOf(chip)
    return { segmentIndex: Math.max(0, chipIndex), offset: 0 }
  }
  if (node === root) {
    const lastIndex = Math.max(0, root.childElementCount - 1)
    return { segmentIndex: lastIndex, offset: selection.focusOffset }
  }
  return null
}

function setCaret(root: HTMLElement, caret: Caret) {
  const target = root.querySelector(
    `[data-mention-text][data-segment-index="${caret.segmentIndex}"]`
  )
  if (!(target instanceof HTMLElement)) {
    return
  }
  const textNode = target.firstChild
  const range = document.createRange()
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const content = textNode.textContent ?? ""
    const zwsp = content.startsWith(ZWSP) ? 1 : 0
    const offset = Math.min(caret.offset + zwsp, content.length)
    range.setStart(textNode, offset)
  } else {
    range.setStart(target, 0)
  }
  range.collapse(true)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function placeCaretAtEnd(root: HTMLElement) {
  const texts = root.querySelectorAll("[data-mention-text]")
  const last = texts[texts.length - 1]
  if (!(last instanceof HTMLElement)) {
    return
  }
  const index = Number(last.dataset.segmentIndex)
  const text = stripZwsp(last.textContent ?? "")
  setCaret(root, { segmentIndex: index, offset: text.length })
}

function createMentionUid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return nanoid()
}

export function MentionInput({
  items,
  kinds,
  segments,
  onSegmentsChange,
  disabled = false,
  placeholder = "",
  className,
  "aria-label": ariaLabel,
  onKeyDown,
  onPasteFiles,
}: MentionInputProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<Caret | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [highlighted, setHighlighted] = useState("")
  const [query, setQuery] = useState<
    (MentionQuery & { segmentIndex: number }) | null
  >(null)
  const [composing, setComposing] = useState(false)

  const kindsByKind = useMemo(
    () => new Map(kinds.map((kind) => [kind.kind, kind])),
    [kinds]
  )

  const filtered = useMemo(
    () =>
      flattenGroupedMentionItems(filterMentionItems(items, search), kinds),
    [items, kinds, search]
  )

  const empty = serializeMentionDocument(segments).trim() === ""
  const open = pickerOpen && query !== null && !disabled && !composing

  useEffect(() => {
    if (filtered.length === 0) {
      setHighlighted("")
      return
    }
    if (!filtered.some((item) => mentionItemValue(item) === highlighted)) {
      setHighlighted(mentionItemValue(filtered[0]!))
    }
  }, [filtered, highlighted])

  useLayoutEffect(() => {
    const root = editorRef.current
    if (!root) {
      return
    }
    const caret = caretRef.current
    if (caret) {
      setCaret(root, caret)
      return
    }
    if (document.activeElement === root) {
      placeCaretAtEnd(root)
    }
  }, [segments])

  const syncQuery = useCallback(
    (next: MentionSegment[], caret: Caret | null) => {
      if (!caret || disabled) {
        setQuery(null)
        setSearch("")
        setPickerOpen(false)
        return
      }
      const found = findMentionQueryInDocument(next, caret)
      setQuery(found)
      setSearch(found?.search ?? "")
      setPickerOpen(found !== null)
    },
    [disabled]
  )

  const emitSegments = useCallback(
    (next: MentionSegment[], caret: Caret | null) => {
      caretRef.current = caret
      onSegmentsChange(next)
      syncQuery(next, caret)
    },
    [onSegmentsChange, syncQuery]
  )

  function handleInput() {
    const root = editorRef.current
    if (!root || disabled) {
      return
    }
    const caret = caretFromSelection(root) ?? caretRef.current
    const next = parseEditor(root)
    emitSegments(next, caret)
  }

  function selectItem(item: MentionItem) {
    if (!query) {
      setPickerOpen(false)
      return
    }
    const uid = createMentionUid()
    const next = insertMention(
      segments,
      query.segmentIndex,
      query,
      item,
      uid
    )
    const mentionIndex = next.findIndex(
      (segment) => segment.type === "mention" && segment.uid === uid
    )
    const caret: Caret = {
      segmentIndex: Math.max(mentionIndex + 1, 0),
      offset: 0,
    }
    emitSegments(next, caret)
    setPickerOpen(false)
    setQuery(null)
    setSearch("")
    requestAnimationFrame(() => {
      const root = editorRef.current
      if (root) {
        root.focus()
        setCaret(root, caret)
      }
    })
  }

  function moveHighlight(delta: number) {
    if (filtered.length === 0) {
      return
    }
    const current = filtered.findIndex(
      (item) => mentionItemValue(item) === highlighted
    )
    const index = current < 0 ? 0 : current
    const next = (index + delta + filtered.length) % filtered.length
    setHighlighted(mentionItemValue(filtered[next]!))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (composing || event.nativeEvent.isComposing) {
      return
    }
    if (open) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        moveHighlight(1)
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        moveHighlight(-1)
        return
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        const item = filtered.find(
          (entry) => mentionItemValue(entry) === highlighted
        )
        if (item) {
          selectItem(item)
        }
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setPickerOpen(false)
        setQuery(null)
        return
      }
    }
    if (event.key === "Backspace") {
      const caret = caretRef.current ?? caretFromSelection(editorRef.current!)
      if (caret && caret.offset === 0 && caret.segmentIndex > 0) {
        const previous = segments[caret.segmentIndex - 1]
        if (previous?.type === "mention") {
          event.preventDefault()
          const next = removeMention(segments, previous.uid)
          emitSegments(next, {
            segmentIndex: Math.max(caret.segmentIndex - 2, 0),
            offset:
              next[Math.max(caret.segmentIndex - 2, 0)]?.type === "text"
                ? (next[Math.max(caret.segmentIndex - 2, 0)] as { text: string })
                    .text.length
                : 0,
          })
          return
        }
      }
    }
    if (event.key === "Enter" && !event.shiftKey) {
      onKeyDown?.(event)
      if (event.defaultPrevented) {
        return
      }
      event.preventDefault()
      event.currentTarget.closest("form")?.requestSubmit()
      return
    }
    onKeyDown?.(event)
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const clipboard = event.clipboardData
    if (!clipboard) {
      return
    }
    const files: File[] = []
    for (const item of clipboard.items) {
      if (item.kind === "file") {
        const file = item.getAsFile()
        if (file) {
          files.push(file)
        }
      }
    }
    if (files.length > 0) {
      event.preventDefault()
      onPasteFiles?.(files)
      return
    }
    const text = clipboard.getData("text/plain")
    if (!text) {
      return
    }
    event.preventDefault()
    const root = editorRef.current
    if (!root) {
      return
    }
    const caret = caretFromSelection(root) ?? caretRef.current
    if (!caret) {
      return
    }
    const segment = segments[caret.segmentIndex]
    if (!segment || segment.type !== "text") {
      return
    }
    const nextText =
      segment.text.slice(0, caret.offset) + text + segment.text.slice(caret.offset)
    const next = segments.map((entry, index) =>
      index === caret.segmentIndex ? { type: "text" as const, text: nextText } : entry
    )
    emitSegments(normalizeMentionDocument(next), {
      segmentIndex: caret.segmentIndex,
      offset: caret.offset + text.length,
    })
  }

  const highlightedItem = filtered.find(
    (item) => mentionItemValue(item) === highlighted
  )

  return (
    <div className="relative">
      <MentionPicker
        items={items}
        kinds={kinds}
        open={open}
        search={search}
        highlighted={highlighted}
        onHighlightedChange={setHighlighted}
        onSelect={selectItem}
        onOpenChange={setPickerOpen}
      />
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? "mention-picker-list" : undefined}
        aria-activedescendant={
          open && highlightedItem ? mentionOptionId(highlightedItem) : undefined
        }
        aria-autocomplete="list"
        aria-disabled={disabled || undefined}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-slot="input-group-control"
        data-placeholder={placeholder}
        data-empty={empty ? "true" : undefined}
        className={cn(
          "field-sizing-content max-h-48 min-h-16 flex-1 overflow-y-auto rounded-none border-0 bg-transparent py-2 shadow-none outline-none ring-0 focus-visible:ring-0",
          "data-[empty=true]:before:pointer-events-none data-[empty=true]:before:text-muted-foreground data-[empty=true]:before:content-[attr(data-placeholder)]",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onInput={(event: FormEvent<HTMLDivElement>) => {
          event.stopPropagation()
          handleInput()
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={() => {
          const root = editorRef.current
          if (root) {
            caretRef.current = caretFromSelection(root) ?? caretRef.current
          }
        }}
        onClick={() => {
          const root = editorRef.current
          if (!root) {
            return
          }
          caretRef.current = caretFromSelection(root)
          if (!caretRef.current) {
            placeCaretAtEnd(root)
            caretRef.current = caretFromSelection(root)
          }
        }}
        onPaste={handlePaste}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => {
          setComposing(false)
          handleInput()
        }}
      >
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return (
              <span
                key={`text-${index}`}
                data-mention-text=""
                data-segment-index={index}
              >
                {segment.text || ZWSP}
              </span>
            )
          }
          const kind = kindsByKind.get(segment.item.kind)
          if (!kind) {
            return null
          }
          return (
            <MentionChip
              key={segment.uid}
              uid={segment.uid}
              item={segment.item}
              kind={kind}
              onRemove={
                disabled
                  ? undefined
                  : () => {
                      const next = removeMention(segments, segment.uid)
                      emitSegments(next, { segmentIndex: 0, offset: 0 })
                      editorRef.current?.focus()
                    }
              }
            />
          )
        })}
      </div>
    </div>
  )
}
