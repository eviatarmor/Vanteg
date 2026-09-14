# Assistant Mentions Design

## Goal

Add a compact, searchable `@` reference picker to Ask Vanteg. A selected reference becomes a removable chip and supplies scoped context to the current Grok conversation. Replace the leading add control with a paperclip beside Send that opens the file picker immediately.

## Interaction

- Typing `@` at the start of a token opens a popover anchored to the composer. Text after `@` filters results by label and description.
- Results are grouped as Agents, Teams, Workflows, Data, Memory, Knowledge, and Connectors. Each group and result has a distinct Lucide or existing brand icon.
- Arrow keys move through results, Enter or click selects, and Escape closes. Selecting removes the active `@query` from the text and adds a chip above the textarea.
- Chips show the type icon, label, and an accessible remove button. Duplicate references are ignored. Backspace with an empty prompt removes the last chip.
- The picker and chips fit the assistant side sheet: 32px controls, a bounded popover, single-line chips that wrap, and no separate toolbar row.
- Remove the leading `+`. Put a paperclip immediately before Send; clicking it directly opens the native file dialog. Existing paste and drag/drop support remains.
- Send is enabled by text or files. References alone do not send an empty request.

## Semantics

Agent and team references do not start another runtime. Grok remains the executor. An agent reference adds its description, instructions, assigned memory/knowledge/workflow identifiers, and capabilities to the system context. A team reference adds its description and member roles, then resolves each member's agent name and instructions.

Workflow references add status and step summaries. Data references initially cover tables and non-secret variable groups; table context is bounded to its schema, columns, and a small row sample. Memory and knowledge references add bounded entry/document summaries. Connector references cover configured connections and their connector identity, without credential fields or secrets.

Reference context is a structured request field. The server validates kind, id, label, and bounded context text before adding it to the system prompt. It never accepts credential values or secret groups. The selected reference snapshot applies to the request that sends it; sent references do not become editable chat text.

## Architecture

Create a feature-local mention registry that adapts existing external-store hooks into a common `AssistantReference` shape. Keep icons in the UI registry and keep the wire payload icon-free. A pure query parser owns detection and replacement of the active `@query`, making keyboard behavior testable without DOM positioning.

`AssistantComposer` owns draft references and the open picker. It returns references with `PromptInputMessage` through a small assistant-specific submit type. `ChatThread` includes them in the per-message body. `request.ts` validates them, and `chat-context.ts` serializes their already-sanitized summaries under a clearly labeled referenced-context section.

## Types

```ts
export type AssistantReferenceKind =
  | "agent"
  | "team"
  | "workflow"
  | "table"
  | "variable-group"
  | "memory"
  | "knowledge"
  | "connector"

export interface AssistantReference {
  kind: AssistantReferenceKind
  id: string
  label: string
  description?: string
  context: string
}
```

Wire validation limits the number of references, field lengths, and total context size. Catalog adapters create context without secret values.

## Verification

- Pure tests cover query detection, replacement, duplicate prevention, and catalog sanitization.
- Composer tests cover opening on `@`, filtering, keyboard/click selection, chip removal, paperclip placement, and Send remaining disabled for reference-only drafts.
- Request and system-prompt tests cover validation, reference serialization, limits, and rejection of malformed data.
- Existing assistant and server tests, changed-file lint, Vite build, and `git diff --check` must pass.
- Per project instructions, browser automation is prohibited; the user will visually confirm the side sheet after implementation.
