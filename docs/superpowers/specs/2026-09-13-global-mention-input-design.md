# Shared Inline Mention Input Design

## Goal

Replace the assistant-only `@` chip bar with a reusable mention field. Typing `@` opens a searchable picker; arrow keys move the highlight while the caret stays in the field; selecting a result inserts a removable chip at the caret. Ask Vanteg is the only consumer in this pass. Other inputs can drop the same field in later.

This supersedes the chip-above-the-textarea interaction in `docs/superpowers/specs/2026-09-12-assistant-mentions-design.md`. Catalog semantics, Grok as the only executor, paperclip-beside-Send, and request validation stay as specified there.

## Interaction

- Typing `@` at a token boundary opens the picker. Text after `@` filters by label and description. A space, email-style `user@host`, or mid-token `@` closes or never opens it.
- Focus stays in the mention field. The popover does not auto-focus. ArrowUp / ArrowDown move the highlight, Enter or click inserts the highlighted item, Escape closes. When the picker is closed, Enter sends and Shift+Enter inserts a newline.
- The first filtered item is highlighted when the picker opens or the filter changes. If the filter matches nothing, Enter does not send and does not insert.
- Selection replaces the active `@query` with a chip at that caret. The chip shows the kind icon, label, and an accessible remove button. The caret lands immediately after the chip so the user can keep typing.
- There is no chip row above the field. Attachments stay in the composer header.
- Backspace deletes the chip immediately before the caret. Clicking remove deletes that chip. The same entity may appear more than once as chips; the Grok payload still unique-keys by `kind:id`.
- IME composition does not open, move, or select the picker.
- Paste of files still adds attachments. Paste of text inserts plain text at the caret. Pasted text is not parsed back into chips.
- The picker stays a compact panel above the field (`side="top"`, `align="start"`). It does not follow the caret.

## Shared component

Create `client/src/components/mention/` as a generic field. It must not import assistant types, stores, or Grok request code.

```ts
export interface MentionItem {
  kind: string
  id: string
  label: string
  description?: string
}

export interface MentionKindMeta {
  kind: string
  label: string
  icon: LucideIcon
}

export type MentionSegment =
  | { type: "text"; text: string }
  | { type: "mention"; item: MentionItem; uid: string }
```

`uid` identifies a chip instance in the document. `kind:id` identifies the catalog entity.

Public pieces:

- `findMentionQuery(text, caret)` — move from `features/assistant/model/mention-query.ts`. Same token-boundary rules.
- `serializeMentionDocument(segments)` — concatenate text and mention labels in document order.
- `uniqueMentionItems(segments)` — first occurrence of each `kind:id`.
- `MentionChip` — compact inline chip used inside the field.
- `MentionPicker` — grouped Command popover. Items and kind metadata are props. Highlight is controlled by the input (`value` / `onValueChange` on Command) so keys work without focusing the list.
- `MentionInput` — contenteditable field that renders text nodes and atomic chips (`contenteditable="false"` on each chip).

`MentionInput` props:

- `items: MentionItem[]`
- `kinds: MentionKindMeta[]`
- `segments` / `onSegmentsChange` (controlled)
- `disabled`, `placeholder`, `aria-label`, `className`
- optional `onKeyDown` after internal handling; if the caller prevents default, built-in Enter-to-send does not run

It exposes `role="textbox"`, `aria-multiline="true"`, and when the picker is open `aria-expanded`, `aria-controls`, and `aria-activedescendant` pointing at the highlighted option. Use `data-slot="input-group-control"` so the existing InputGroup focus ring still applies.

Empty state uses a CSS placeholder (`data-placeholder` when the document has no text and no chips), not a nested `<textarea>`. Height matches `PromptInputTextarea` (`min-h-16` default, compact `min-h-11`, `max-h-48`, grow with content). If InputGroup only auto-grows for `textarea` children, add an equivalent rule for this control so the composer does not clip.

## Composer integration

`AssistantComposer` is the only consumer.

- Keep `PromptInputProvider` for attachments, paperclip, and submit.
- Replace `PromptInputTextarea` with `MentionInput`.
- Map `useAssistantReferenceCatalog()` into `MentionItem[]` (`kind`, `id`, `label`, `description`). Keep kind icons/labels in the assistant feature as `MentionKindMeta[]` passed into the input.
- On every segment change, write `serializeMentionDocument(segments)` into `textInput.setInput` so Send muting and PromptInput submit keep working.
- On submit, pass `uniqueMentionItems(segments)` mapped back to `AssistantReference[]` via the catalog (including `context`). Then clear segments.
- Remove `ReferenceChips` from `PromptInputHeader`. Remove assistant-local `AssistantMentionPicker` and the assistant-local mention-query module after the shared copies exist.
- Paperclip immediately before Send is unchanged. Model, access, and effort stay enabled independently of Send.
- Send is enabled when serialized text is non-empty or files exist. A chip-only draft is sendable because the label is now the text.
- After a successful submit, PromptInput still clears `textInput`; `MentionInput` must reset when `segments` are cleared.
- When the document is empty (no text, no chips) and attachments exist, Backspace still removes the last attachment.

Busy state: the field is not editable while a reply is in progress; Enter does not send another request.

## Data sent to Grok

Unchanged transport, with two document-driven inputs:

- User message text is `serializeMentionDocument(segments).trim()`. Example: `Ask Support copilot about tickets`.
- Request `references` are the unique catalog snapshots for chips in that draft, still validated in `request.ts` (max 12, identity/context length limits, no secrets).

If the user inserts more than 12 unique entities, the extra chips stay in the visible document and in the user text, but only the first 12 unique `kind:id` values are sent as `references`. Server validation remains the backstop.

Duplicate chips of the same entity produce one reference.

Sent chat history stores the serialized labels as ordinary message text. Chips are a draft-only UI.

## DOM and keyboard notes

`MentionInput` is DOM-backed:

- Typing happens in text nodes. `onInput` walks children into `MentionSegment[]`.
- A chip is a `contenteditable="false"` span with `data-mention-uid`, `data-mention-kind`, and `data-mention-id`.
- Inserting a mention deletes the `@query` range, inserts the chip, and places the caret in a text node after it.
- Picker navigation uses the filtered item list and a controlled Command `value`. Arrow/Enter/Escape are handled on the textbox `onKeyDown` and `preventDefault` so they never move the textarea caret or submit.

Do not add Tiptap, Lexical, or another editor dependency.

## Testing

Pure tests:

- `@` detection at token boundaries, including emails and mid-token `@`.
- Insert replaces `@query` at the caret and serializes labels in place (`Ask @ops` + select → `Ask Ops`).
- Unique items by `kind:id` keep first occurrence.
- Removing a chip by uid joins neighboring text.

Component tests:

- Picker groups, filters, click-select, ArrowDown then Enter selects the next item, Escape closes, focus remains on the textbox.
- Composer: type `@`, arrow, Enter → chip in the field (no header chip row); remove via chip button and via Backspace; duplicate entity allowed as a second chip but one reference on submit; chip-only Send is enabled; paperclip still immediately before Send; model/access/effort stay enabled.
- Existing request, chat-context, and chat-handler tests stay green.

Do not use browser automation. After implementation, the user confirms the assistant side sheet visually.

## Out of scope

- Wiring mentions into other inputs.
- Moving the primitive into `packages/ui`.
- Caret-following popover positioning.
- Reconstructing chips from pasted or stored message text.
- Changing catalog contents, secret redaction, or Grok executor rules.
