import {
  useCallback,
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
  deleteAtCaret,
  filterMentionItems,
  findMentionQueryInDocument,
  flattenGroupedMentionItems,
  insertMention,
  insertTextAtCaret,
  mentionItemValue,
  normalizeMentionDocument,
  removeMention,
  serializeMentionDocument,
} from "./mention-document"
import type { MentionQuery } from "./mention-query"
import { MentionChip } from "./MentionChip"
import { mentionOptionId } from "./mention-document"
import { MentionPicker } from "./MentionPicker"
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
  const segmentsRef = useRef(segments)
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
  const activeHighlight =
    filtered.length === 0
      ? ""
      : filtered.some((item) => mentionItemValue(item) === highlighted)
        ? highlighted
        : mentionItemValue(filtered[0]!)

  useLayoutEffect(() => {
    segmentsRef.current = segments
  }, [segments])

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
      segmentsRef.current = next
      caretRef.current = caret
      onSegmentsChange(next)
      syncQuery(next, caret)
    },
    [onSegmentsChange, syncQuery]
  )

  function fallbackCaret(): Caret {
    const root = editorRef.current
    const fromDom = root ? caretFromSelection(root) : null
    if (caretRef.current) {
      return caretRef.current
    }
    if (fromDom) {
      return fromDom
    }
    const current = segmentsRef.current
    const last = current.length - 1
    const segment = current[last]
    return {
      segmentIndex: Math.max(last, 0),
      offset: segment?.type === "text" ? segment.text.length : 0,
    }
  }

  function handleInput() {
    const root = editorRef.current
    if (!root || disabled) {
      return
    }
    const caret = caretFromSelection(root) ?? caretRef.current
    const next = parseEditor(root)
    emitSegments(next, caret)
  }

  function applyInsert(text: string) {
    const result = insertTextAtCaret(
      segmentsRef.current,
      fallbackCaret(),
      text
    )
    emitSegments(result.segments, result.caret)
  }

  function applyDelete() {
    const result = deleteAtCaret(segmentsRef.current, fallbackCaret())
    emitSegments(result.segments, result.caret)
  }

  function selectItem(item: MentionItem) {
    if (!query) {
      setPickerOpen(false)
      return
    }
    const uid = createMentionUid()
    const next = insertMention(
      segmentsRef.current,
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
      (item) => mentionItemValue(item) === activeHighlight
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
          (entry) => mentionItemValue(entry) === activeHighlight
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
      event.preventDefault()
      applyDelete()
      onKeyDown?.(event)
      return
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault()
      applyInsert(event.key)
      return
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
    (item) => mentionItemValue(item) === activeHighlight
  )

  return (
    <div className="relative">
      <MentionPicker
        items={items}
        kinds={kinds}
        open={open}
        search={search}
        highlighted={activeHighlight}
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
          if (composing) {
            handleInput()
          }
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          const root = editorRef.current
          if (!root) {
            return
          }
          if (!caretFromSelection(root)) {
            placeCaretAtEnd(root)
          }
          caretRef.current = caretFromSelection(root) ?? fallbackCaret()
        }}
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
