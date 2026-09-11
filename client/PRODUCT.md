# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are operations and automation builders. They open Vanteg to connect apps, build and run workflows, wire agents into that work, and clear Inbox so automations keep moving without the builder redoing every step.

Other roles (agent authors, approvers, engineers calling Vanteg from outside the workspace) appear in the product, but they are not the primary audience unless later confirmed.

## Product Purpose

Vanteg is a workspace for building workflows, agents, and teams that connect a company’s apps. The job is to automate work that used to wait on a person, then keep a human in the loop only when a run, agent, or credential actually needs a decision.

Success is that the builder can stand up an automation, attach the agents and data it needs, and operate it from Home, Inbox, and Runs — not that the product looks complete as a marketing site.

## Positioning

Vanteg is one operating workspace: workflows, personalized agents, multi-agent teams (graphs with roles), shared data/memory/connectors, and a human-in-the-loop Inbox live together. A neighboring workflow tool can copy a canvas; a neighboring chatbot can copy a thread. Neither can truthfully claim this shared operating surface.

## Operating Context

Builders work in a signed-in web workspace with a persistent shell.

- **Work:** Home (workspace overview and suggested automations), Assistant (“Ask Vanteg” chat, full page or docked), Inbox (approve, deny, or always-allow work from agents, workflows, and credentials).
- **Build:** Workflows (canvas of triggers and actions; drafts, deployed, and runs), Agents (model, instructions, capabilities, assigned memory/knowledge/workflows/credentials), Teams (multi-agent graphs with roles such as lead and specialist), Data (tables, variables, secrets used by workflows), Memory (shared memory bases and knowledge files).
- **Manage:** Connectors (OAuth apps plus MCP servers), API Keys (calling Vanteg from outside this workspace).
- **Account:** Help, Settings, login/sign-up.

Connectors are chosen from a catalog (`packages/integrations`): featured apps expose named triggers and actions on the workflow canvas; long-tail apps are connectable from the Connectors page. Vanteg-owned OAuth clients live under `infra/` so workspace users can click Connect instead of pasting a client ID and secret. MCP servers are added from pasted config (mcp.json, npx, docker, URL, Cursor link).

Dev entry is `npm run dev` (Vite at `http://127.0.0.1:5173`). Auth is a mock session in localStorage, with a DEV/test soft default so demos stay signed in until explicit logout.

## Capabilities and Constraints

Confirmed product surfaces (preserve unless the user changes them): Home, Assistant, Inbox, Workflows (including the editor canvas), Agents, Teams, Data, Memory, Connectors, API Keys, Help, Settings, login/sign-up, OAuth callback.

Hard UI/product rules:

- Passwords, API keys, tokens, client secrets, and other secret values use `SecretInput` (mask with last character visible). Never a native password input. Secret-sensitive workflow I/O is masked in explorers the same way.
- `@workspace/ui` never imports from `client`. Product pages live under `client/src/features/` and register in the shell catalog plus the router.

Technical shape of the current app (not a claim that this is the production backend):

- Client-side stores and mock auth. There is no confirmed production API, identity provider, or billing backend.
- Workflow and team graphs use a node canvas. Agent models and capabilities are configured in-product.

Explicitly undecided / not product truth:

- Real customers, pricing, plans, seats, invoices, subprocessors, DPA, status page, and `vanteg.app` / `status.vanteg.app` legal URLs. Those exist as Settings UI fixtures.
- Seed stories and metrics (Form intake, Support copilot, engineering team, Home “runs this week”, Inbox badge counts, invented model names as market facts). They illustrate the shell; they are not evidence.
- Accessibility standard beyond ordinary web practice (none was set in init).
- Production hosting, licensing, and SLAs.

## Brand Commitments

- Product name: **Vanteg**.
- In-product assistant: **Ask Vanteg**.
- Current identity on auth and chrome is the product name as text. No separate logo/wordmark asset is on hand.
- Voice in shipped copy is direct and operational (workspace, runs, approvals, connectors) — not campaign marketing. Keep that unless the user binds a different voice.
- Nav label **Connectors** (not “Integrations”) is the in-product term for the integrations surface.

## Evidence on Hand

Real, reusable product language lives in the app: Help FAQ (`client/src/features/help/model/faq.ts`), shell page copy (`client/src/features/shell/model/catalog.ts`), Home suggestions, and README/docs (`README.md`, `docs/integrations.md`, `docs/ui-conventions.md`).

Do not fabricate testimonials, named customers, case studies, press, benchmarks, or live production screenshots. Demo seed data and compliance fixtures must not be quoted as proof.

## Product Principles

1. **One workspace, shared context.** Workflows, agents, teams, data, memory, and connectors are parts of the same operating surface, not a suite of disconnected tools.
2. **Humans decide only when needed.** Inbox is how agents, workflows, and credentials wait on a person (approve, deny, always allow).
3. **Builders first.** Primary success is an ops/automation builder getting work standing and keeping it running — scanability and task completion outrank persuasion.
4. **Secrets stay secrets.** Credential and token presentation is a product rule: mask, never leak length or values in lists unless the established SecretInput pattern applies.
5. **Demo is not proof.** Future work may use seed content as UI furniture, but must not promote it into customers, metrics, legal, or pricing claims.
