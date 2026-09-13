# Shared Inline Mention Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a reusable contenteditable mention field that inserts chips at the caret, drive it from Ask Vanteg, and drop the header chip bar.

**Architecture:** Generic mention types, query parser, and document helpers live in `client/src/components/mention/`. `MentionInput` owns the picker, keyboard highlight, and atomic chips. The assistant composer maps catalog snapshots in and unique references out. Grok request validation is unchanged.

**Tech Stack:** React 19, TypeScript, cmdk Command, Radix Popover, Lucide, AI Elements PromptInput, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-13-global-mention-input-design.md`

## Global Constraints

- Do not import assistant types, stores, or Grok request code from `client/src/components/mention/`.
- Do not add Tiptap, Lexical, or another editor dependency.
- Grok remains the only executor; catalog contents, secret redaction, and request validation stay as they are.
- Paperclip stays immediately before Send. Model, access, and effort stay enabled independently of Send.
- Focus stays in the mention field while the picker is open. The popover does not auto-focus and does not follow the caret (`side="top"`, `align="start"`).
- Serialized user text includes mention labels in document order. Unique `kind:id` snapshots go to Grok (first 12). Duplicate chips are allowed visually.
- A chip-only draft is sendable. There is no header chip row.
- Do not use browser automation. Follow red-green-refactor: every production behavior starts with a failing test.
- Ask Vanteg is the only consumer this pass.

---

### Task 1: Shared mention types, query, and document

**Files:**
- Create: `client/src/components/mention/types.ts`
- Create: `client/src/components/mention/mention-query.ts`
- Create: `client/src/components/mention/mention-query.test.ts`
- Create: `client/src/components/mention/mention-document.ts`
- Create: `client/src/components/mention/mention-document.test.ts`
- Create: `client/src/components/mention/index.ts`

**Interfaces:**
- Produces: `MentionItem`, `MentionKindMeta`, `MentionSegment`, `MentionQuery`, `findMentionQuery(text, caret)`, `mentionKey(item)`, `emptyMentionDocument()`, `normalizeMentionDocument(segments)`, `serializeMentionDocument(segments)`, `uniqueMentionItems(segments)`, `insertMention(segments, segmentIndex, query, item, uid)`, `removeMention(segments, uid)`, `findMentionQueryInDocument(segments, caret)`, `filterMentionItems(items, search)`, `groupedMentionItems(items, kinds)`, `flattenGroupedMentionItems(items, kinds)`, `mentionItemValue(item)`.

- [ ] **Step 1: Write failing tests** in `mention-query.test.ts` (copy the existing assistant query cases: token-boundary `@`, search through caret, bare `@`, emails, mid-token). Write `mention-document.test.ts` covering:

```ts
it("serializes labels in place after inserting at the caret", () => {
  const item = { kind: "agent", id: "ops", label: "Ops" }
  const segments = [{ type: "text" as const, text: "Ask @ops please" }]
  const query = findMentionQuery("Ask @ops please", 8)!
  const next = insertMention(segments, 0, query, item, "uid-1")
  expect(serializeMentionDocument(next)).toBe("Ask Ops please")
  expect(next.map((segment) => segment.type)).toEqual([
    "text",
    "mention",
    "text",
  ])
})

it("keeps the first occurrence of each kind:id", () => {
  const item = { kind: "agent", id: "ops", label: "Ops" }
  const segments = [
    { type: "text" as const, text: "A " },
    { type: "mention" as const, item, uid: "a" },
    { type: "text" as const, text: " and " },
    { type: "mention" as const, item, uid: "b" },
    { type: "text" as const, text: "" },
  ]
  expect(uniqueMentionItems(segments)).toEqual([item])
})

it("joins neighboring text when a chip is removed", () => {
  const item = { kind: "agent", id: "ops", label: "Ops" }
  const segments = [
    { type: "text" as const, text: "Ask " },
    { type: "mention" as const, item, uid: "uid-1" },
    { type: "text" as const, text: " please" },
  ]
  expect(serializeMentionDocument(removeMention(segments, "uid-1"))).toBe(
    "Ask  please"
  )
})
```

Also test `filterMentionItems` by label/description and `groupedMentionItems` omitting empty kinds.

- [ ] **Step 2: Run** `npm test -w client -- src/components/mention/mention-query.test.ts src/components/mention/mention-document.test.ts` and confirm failures from missing modules.

- [ ] **Step 3: Implement** types, move `findMentionQuery` (do not move `replaceMentionQuery`; chip insert keeps surrounding text). Implement document helpers. `normalizeMentionDocument` merges adjacent text and ensures a text segment before the first and after the last mention. `mentionItemValue` is `` `${kind}:${id}` ``.

- [ ] **Step 4: Re-run the focused tests** and keep them green.

- [ ] **Step 5: Commit** `feat(mention): add shared document model`

---

### Task 2: MentionPicker

**Files:**
- Create: `client/src/components/mention/MentionPicker.tsx`
- Create: `client/src/components/mention/MentionPicker.test.tsx`
- Modify: `client/src/components/mention/index.ts`

**Interfaces:**
- Consumes: `MentionItem`, `MentionKindMeta`, `filterMentionItems`, `groupedMentionItems`, `mentionItemValue`.
- Produces: `MentionPicker({ items, kinds, open, search, highlighted, onHighlightedChange, onSelect, onOpenChange })`.

- [ ] **Step 1: Write failing tests** using Bot/Workflow icons from lucide. Cover: listbox named Mentions when open; hidden when closed; group headings; filter by search; click-select calls `onSelect` and `onOpenChange(false)`; `highlighted` marks the matching option (`aria-selected` or `data-selected`).

- [ ] **Step 2: Run** `npm test -w client -- src/components/mention/MentionPicker.test.tsx` and confirm failures.

- [ ] **Step 3: Implement** the picker from `AssistantMentionPicker`, but generic. Controlled Command `value={highlighted}` / `onValueChange={onHighlightedChange}`. `onOpenAutoFocus` preventDefault. Popover `side="top"` `align="start"` `sideOffset={6}` `className="w-64 max-w-[min(16rem,calc(100vw-2rem))] p-0"`. Anchor is a zero-size span. Option `id={`mention-option-${mentionItemValue(item)}`}` for `aria-activedescendant`.

- [ ] **Step 4: Re-run focused tests.**

- [ ] **Step 5: Commit** `feat(mention): add shared mention picker`

---

### Task 3: MentionChip and MentionInput

**Files:**
- Create: `client/src/components/mention/MentionChip.tsx`
- Create: `client/src/components/mention/MentionInput.tsx`
- Create: `client/src/components/mention/MentionInput.test.tsx`
- Modify: `packages/ui/src/components/input-group.tsx` — add `has-[[contenteditable=true]]:h-auto` next to `has-[>textarea]:h-auto`
- Modify: `client/src/components/mention/index.ts`

**Interfaces:**
- Consumes: document helpers, `MentionPicker`, `MentionChip`.
- Produces: `MentionInput({ items, kinds, segments, onSegmentsChange, disabled?, placeholder?, className?, "aria-label"?, onKeyDown? })`.

- [ ] **Step 1: Write failing tests** with two items (Support Bot, Sales Agent) and one kind (Agents/Bot):

```ts
it("opens Mentions on @ and inserts the highlighted item at the caret with ArrowDown then Enter", async () => {
  const { user, onSegmentsChange } = renderInput({
    segments: [{ type: "text", text: "Ask " }],
  })
  const box = screen.getByRole("textbox", { name: "Message" })
  await user.click(box)
  await user.type(box, "@")
  const mentions = await screen.findByRole("listbox", { name: "Mentions" })
  expect(within(mentions).getByRole("option", { name: "Support Bot" })).toBeInTheDocument()
  await user.keyboard("{ArrowDown}{Enter}")
  expect(screen.queryByRole("listbox", { name: "Mentions" })).not.toBeInTheDocument()
  const next = onSegmentsChange.mock.calls.at(-1)?.[0] as MentionSegment[]
  expect(serializeMentionDocument(next)).toBe("Ask Sales Agent")
  expect(within(box).getByRole("button", { name: "Remove Sales Agent" })).toBeInTheDocument()
})
```

Also: Escape closes and leaves `@`; click-select inserts; remove button deletes the chip; Backspace immediately after a chip removes it; duplicate chips allowed; `aria-expanded`/`aria-activedescendant` while open; empty document shows placeholder via `data-placeholder`; Enter with picker closed calls `requestSubmit` on the ancestor form (wrap in `<form>`).

- [ ] **Step 2: Run** `npm test -w client -- src/components/mention/MentionInput.test.tsx` and confirm failures.

- [ ] **Step 3: Implement** `MentionChip` as `contentEditable={false}` span with `data-mention-uid`, `data-mention-kind`, `data-mention-id`, `data-mention-label`, kind icon, label, and remove button (`aria-label={`Remove ${item.label}`}`).

Implement `MentionInput` as a controlled contenteditable (`role="textbox"` `aria-multiline="true"` `data-slot="input-group-control"`). Parse the DOM on input into segments. On structural changes (insert/remove/external reset), render chips as atomic nodes and put the caret in the text node after the inserted chip. While a mention query is active and not disabled, open the picker; keep focus in the field; ArrowUp/Down move highlight over `flattenGroupedMentionItems(filterMentionItems(items, search), kinds)`; Enter/click inserts via `insertMention` with `crypto.randomUUID()` (fallback `nanoid`); Escape closes. IME: ignore those keys while `isComposing`. Paste files through optional `onPasteFiles` or `usePromptInputAttachments` if present; otherwise insert `text/plain`. Placeholder: `data-placeholder` and `data-empty="true"` when serialized trim is empty.

Height: `field-sizing-content max-h-48 min-h-16` plus caller `className`.

- [ ] **Step 4: Re-run focused tests.**

- [ ] **Step 5: Commit** `feat(mention): insert chips at the caret`

---

### Task 4: Assistant composer integration

**Files:**
- Create: `client/src/features/assistant/model/mention-kinds.ts`
- Modify: `client/src/features/assistant/ui/AssistantComposer.tsx`
- Modify: `client/src/features/assistant/AssistantPage.test.tsx`
- Delete: `client/src/features/assistant/ui/AssistantMentionPicker.tsx`
- Delete: `client/src/features/assistant/ui/AssistantMentionPicker.test.tsx`
- Delete: `client/src/features/assistant/model/mention-query.ts`
- Delete: `client/src/features/assistant/model/mention-query.test.ts`

**Interfaces:**
- Consumes: `MentionInput`, `serializeMentionDocument`, `uniqueMentionItems`, `emptyMentionDocument`, `useAssistantReferenceCatalog`, `MAX_CHAT_REFERENCES`.
- Produces: composer still submits `AssistantComposerSubmitMessage` with `text` = serialized labels and `references` = unique catalog snapshots (slice 0..12).

- [ ] **Step 1: Rewrite failing composer tests:**

```ts
it("opens Mentions when typing @ and inserts Support copilot at the caret", async () => {
  const { user } = renderAssistant()
  const box = screen.getByRole("textbox", { name: "Message" })
  await user.type(box, "Ask @")
  await user.click(await screen.findByRole("option", { name: "Support copilot" }))
  expect(within(box).getByRole("button", { name: "Remove Support copilot" })).toBeInTheDocument()
  expect(box).toHaveTextContent(/Ask\s+Support copilot/)
  expect(screen.queryByRole("listbox", { name: "Mentions" })).not.toBeInTheDocument()
})

it("selects the next mention with ArrowDown then Enter", async () => {
  const { user } = renderAssistant()
  const box = screen.getByRole("textbox", { name: "Message" })
  await user.type(box, "@")
  await user.keyboard("{ArrowDown}{Enter}")
  expect(within(box).getByRole("button", { name: "Remove Research analyst" })).toBeInTheDocument()
})

it("allows a second chip of the same entity and sends one reference", async () => {
  const { requests } = installChatSpy()
  const { user } = renderAssistant()
  const box = screen.getByRole("textbox", { name: "Message" })
  await user.type(box, "@")
  await user.click(await screen.findByRole("option", { name: "Support copilot" }))
  await user.type(box, " @")
  await user.click(await screen.findByRole("option", { name: "Support copilot" }))
  expect(screen.getAllByRole("button", { name: "Remove Support copilot" })).toHaveLength(2)
  await user.click(screen.getByRole("button", { name: "Send" }))
  await waitFor(() => expect(requests.length).toBeGreaterThan(0))
  expect(requests[0]).toMatchObject({
    messages: expect.any(Array),
  })
  const body = requests[0] as { references: { id: string }[]; messages: { parts: { text: string }[] }[] }
  expect(body.references).toHaveLength(1)
  expect(body.references[0]?.id).toBe("agent-support")
})

it("enables Send for a chip-only draft", async () => {
  const { requests } = installChatSpy()
  const { user } = renderAssistant()
  const box = screen.getByRole("textbox", { name: "Message" })
  await user.type(box, "@")
  await user.click(await screen.findByRole("option", { name: "Support copilot" }))
  const send = screen.getByRole("button", { name: "Send" })
  expect(send).not.toHaveAttribute("aria-disabled", "true")
  await user.click(send)
  await waitFor(() => expect(requests.length).toBeGreaterThan(0))
})
```

Keep the paperclip-before-Send test. Remove the old empty-value / header-chip / muted-chip-only assertions. Backspace after a chip removes that chip (not a header stack).

- [ ] **Step 2: Run** `npm test -w client -- src/features/assistant/AssistantPage.test.tsx` and confirm the mention cases fail for the old textarea/chip-bar behavior.

- [ ] **Step 3: Implement composer.** `assistantMentionKinds` holds the current kind icons/labels. Map catalog to `MentionItem[]`. Controlled `segments`. On change, `textInput.setInput(serializeMentionDocument(segments))`. Replace `PromptInputTextarea` with `MentionInput` (`disabled={busy}`, compact min-height). Remove `ReferenceChips`, picker, caret textarea handlers. On submit, map `uniqueMentionItems(segments).slice(0, MAX_CHAT_REFERENCES)` back through the catalog to `AssistantReference[]`, then `setSegments(emptyMentionDocument())`. Delete assistant-local picker/query files.

- [ ] **Step 4: Re-run** `npm test -w client -- src/features/assistant src/components/mention src/server/chat-handler.test.ts src/features/workflows/model/chat-context.test.ts`.

- [ ] **Step 5: Commit** `feat(assistant): use inline mention chips`

---

### Task 5: Regression verification

**Files:** only files required by failures from Tasks 1–4.

- [ ] **Step 1: Run** `npm test -w client -- src/features/assistant src/components/mention src/server/chat-handler.test.ts src/features/workflows/model/chat-context.test.ts`

- [ ] **Step 2: ESLint** every changed TypeScript/TSX file.

- [ ] **Step 3: Run** `npx vite build --logLevel error` from `client`.

- [ ] **Step 4: Run** `git diff --check` and inspect the diff.

- [ ] **Step 5: Report exact verification output and ask the user to inspect the assistant side sheet.** Browser automation is prohibited.
