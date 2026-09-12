# Assistant Mentions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add searchable `@` references with removable chips and a compact paperclip attachment action to Ask Vanteg.

**Architecture:** A feature-local catalog normalizes existing stores into sanitized references. Pure mention parsing drives a controlled composer popover, while validated reference summaries travel in the chat request and become bounded Grok system context.

**Tech Stack:** React 19, TypeScript, AI Elements prompt input, Radix/shadcn Command + Popover, Lucide icons, AI SDK, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-12-assistant-mentions-design.md`

## Global Constraints

- Grok remains the only executor; agent and team references contribute instructions and resources as context.
- Never expose secret groups, secret values, OAuth tokens, API keys, or credential fields.
- Remove the leading `+`; place a paperclip directly before Send and open the native file chooser on click.
- Keep side-sheet controls compact and keyboard accessible.
- Do not use browser automation; automated repository tests are allowed.
- Follow strict red-green-refactor: every production behavior starts with a failing test.

---

### Task 1: Reference types, mention parsing, and catalog

**Files:**
- Create: `client/src/features/assistant/model/references.ts`
- Create: `client/src/features/assistant/model/references.test.ts`
- Create: `client/src/features/assistant/model/mention-query.ts`
- Create: `client/src/features/assistant/model/mention-query.test.ts`
- Modify: `client/src/features/assistant/model/types.ts`

**Interfaces:**
- Produces: `AssistantReferenceKind`, `AssistantReference`, `useAssistantReferenceCatalog()`, `findMentionQuery(text, caret)`, and `replaceMentionQuery(text, query, replacement?)`.
- `useAssistantReferenceCatalog()` reads agents, teams, workflows, data, memory, and configured integration connections through their existing hooks and returns icon-free, sanitized reference records.

- [ ] **Step 1: Write failing pure tests** for `@` detection only at a token boundary, filtering text and replacement, duplicate keys (`kind:id`), every requested catalog group, bounded context, and absence of secrets/credential fields.
- [ ] **Step 2: Run** `rtk npm test -w client -- src/features/assistant/model/mention-query.test.ts src/features/assistant/model/references.test.ts` and confirm failures are caused by missing modules/behavior.
- [ ] **Step 3: Implement the types and pure parser**, keeping the active query as `{ start: number; end: number; search: string }` and replacing the query with an empty string plus normalized surrounding whitespace.
- [ ] **Step 4: Implement the catalog adapters**. Include agent instructions; resolved team members; workflow status/steps; table schema, columns, and at most 20 rows; non-secret variables; bounded memory entries and knowledge-document metadata/content; configured connector identity and bounded non-secret sheet data. Cap each `context` at 8,000 characters and never enumerate secret groups or credential fields.
- [ ] **Step 5: Re-run the focused tests** and refactor only while they remain green.

### Task 2: Composer picker, chips, and paperclip

**Files:**
- Create: `client/src/features/assistant/ui/AssistantMentionPicker.tsx`
- Create: `client/src/features/assistant/ui/AssistantMentionPicker.test.tsx`
- Modify: `client/src/features/assistant/ui/AssistantComposer.tsx`
- Modify: `client/src/features/assistant/AssistantPage.test.tsx`

**Interfaces:**
- Consumes: `AssistantReference[]`, the query helpers, and the normalized catalog.
- Produces: `AssistantComposerSubmitMessage = PromptInputMessage & { references: AssistantReference[] }` passed to `onSubmit`.

- [ ] **Step 1: Write failing UI tests** that type `@`, see grouped/filterable choices, select with click and keyboard, receive a removable chip, ignore duplicates, remove the last chip with Backspace on an empty prompt, and keep Send disabled for reference-only input.
- [ ] **Step 2: Add failing attachment tests** asserting there is no leading add button and that the `Add attachments` paperclip is immediately before Send and triggers the hidden file input.
- [ ] **Step 3: Run** `rtk npm test -w client -- src/features/assistant/ui/AssistantMentionPicker.test.tsx src/features/assistant/AssistantPage.test.tsx` and confirm expected failures.
- [ ] **Step 4: Implement `AssistantMentionPicker`** with controlled Command/Popover behavior, semantic groups, Lucide icons per kind, a bounded top-opening panel for the side sheet, and keyboard navigation.
- [ ] **Step 5: Integrate controlled text and chips into `AssistantComposer`**. Remove the `@query` on selection, render wrapping compact chips inside the composer, expose accessible remove labels, and clear references after a successful submit handoff.
- [ ] **Step 6: Move `PromptInputActionAddAttachments`** into a 32px paperclip trigger immediately before `ComposerSubmit`; remove the old `+` trigger. Preserve paste/drop behavior from `PromptInputProvider`.
- [ ] **Step 7: Re-run focused UI tests** and keep all existing model/access/effort controls enabled independently of Send.

### Task 3: Request transport and Grok context

**Files:**
- Modify: `client/src/features/assistant/ui/ChatThread.tsx`
- Modify: `client/src/features/assistant/model/request.ts`
- Modify: `client/src/features/assistant/model/request.test.ts`
- Modify: `client/src/features/assistant/model/chat-context.ts`
- Modify: `client/src/features/workflows/model/chat-context.test.ts`
- Modify: `client/src/server/chat-handler.ts`
- Modify: `client/src/server/chat-handler.test.ts`

**Interfaces:**
- Consumes: `AssistantReference[]` from the composer.
- Produces: `ParsedChatRequest.references`, validated with a maximum of 12 references, 200 characters for identity fields, 8,000 characters per context, and 32,000 characters total.

- [ ] **Step 1: Write failing request tests** for valid references, unknown kinds, malformed fields, count/length limits, and total-size rejection.
- [ ] **Step 2: Write failing prompt/handler tests** proving agent instructions and resource summaries appear under a referenced-context delimiter and malformed references return HTTP 400.
- [ ] **Step 3: Run** `rtk npm test -w client -- src/features/assistant/model/request.test.ts src/features/workflows/model/chat-context.test.ts src/server/chat-handler.test.ts` and confirm expected failures.
- [ ] **Step 4: Send references from `ChatThread`** in the per-send body and include empty arrays only when required by types. Do not allow references alone to bypass the existing non-empty text/file guard.
- [ ] **Step 5: Parse and validate references in `request.ts`**, returning precise 400 errors and never accepting extra secret-bearing structures.
- [ ] **Step 6: Append bounded reference summaries in `buildSystemPrompt`** with kind and label delimiters; pass parsed references from `chat-handler.ts`.
- [ ] **Step 7: Re-run focused transport/server tests** and refactor with green tests.

### Task 4: Regression verification

**Files:**
- Modify only files required by failures introduced by Tasks 1–3.

**Interfaces:**
- Produces: a verified assistant feature ready for user visual review.

- [ ] **Step 1: Run assistant/server tests:** `rtk npm test -w client -- src/features/assistant src/server/chat-handler src/features/workflows/model/chat-context.test.ts`.
- [ ] **Step 2: Run changed-file ESLint** on every changed TypeScript/TSX file.
- [ ] **Step 3: Run** `rtk npx vite build --logLevel error` from `client`.
- [ ] **Step 4: Run** `rtk git diff --check` and inspect `rtk git diff --stat` plus the full relevant diff.
- [ ] **Step 5: Report exact verification output and ask the user to inspect the assistant side sheet**, as browser automation is prohibited by `AGENTS.md`.
