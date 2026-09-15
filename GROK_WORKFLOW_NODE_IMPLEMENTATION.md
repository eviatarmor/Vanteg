# Task: implement comprehensive workflow-node inputs and outputs

Work directly in this repository and finish the implementation, not merely another plan. Read `AGENTS.md`, `C:\Users\Eviatar\.codex\RTK.md`, `client/PRODUCT.md`, and the relevant workflow/integration source and tests before editing. Preserve existing behavior and saved workflows where possible. Do not use a browser, Playwright, Chrome, screenshots, or browser automation. Use repository tests, typechecking, and build checks only.

## Product goal

Every node in the current workflow catalog must have a meaningful, schema-driven Setup contract, runtime input contract, runtime output contract, validation rules, and correct ports. Builders must be able to insert upstream values into fields as expression chips, understand required data, and see the data made available downstream.

The key architectural defect to remove is `client/src/features/workflows/model/node-io.ts` inferring runtime outputs from setup field keys. Configuration fields are not outputs. Node definitions must declare outputs explicitly. Do not leave known nodes with accidental setup-field outputs or undifferentiated `payload`/`result` if a meaningful domain schema is known.

## Architecture

1. Extend workflow and integration node definitions with backward-compatible declarative metadata for:
   - rich fields: value type, required/default, validation, fixed/expression capability, section, conditional visibility, sensitivity, repeatability/resource metadata;
   - declared runtime inputs and outputs, including nested/domain fields, descriptions, optionality and secrecy;
   - static or dynamic ports;
   - optional node testing/execution capabilities.
2. Keep loading current saved workflows. Add normalization/migration where required. Avoid a needless all-at-once change from `Record<string, string>` if it would break persistence; structured controls may serialize stable JSON while the migration evolves.
3. Replace output inference with the definitions' explicit contracts. Preserve secret masking and never expose credential IDs, tokens, signing secrets, or other setup secrets as outputs.
4. Make schema completeness enforceable by tests for every catalog node and every generated integration method.

## Reusable UI controls

Build reusable declarative controls rather than bespoke forms:

- `WorkflowExpressionInput`: adapt/reuse the existing mention input/chip infrastructure. It must insert upstream node paths serialized like `{{Webhook.body.email}}`, support fixed text plus chips, keyboard editing/removal, missing-reference warnings, nested upstream output selection, and secret masking. Fields declare fixed, expression, or either mode.
- Condition builder: repeatable Value 1 / typed operator / Value 2 rows, AND/OR joining, expression-capable operands, and unary operators that hide Value 2. Operator categories:
  - General: exists, does not exist, empty, not empty, type is.
  - String: equals/not equals, contains/not contains, starts/ends with, regex.
  - Number: equality/inequality, greater/less and inclusive variants, between.
  - Date & Time: before, after, on, between, past, future.
  - Boolean: true, false, equals.
  - Array: contains, not contains, any/all, length comparisons, empty.
  - Object: has/does-not-have key, property equals, empty.
- Key/value editor for headers and query parameters.
- Mapping editor for field assignments and renames.
- Schema builder for AI extraction/dynamic structured outputs.
- Cron/schedule builder.
- Repeatable route/case editor with stable IDs.
- Conditional field rendering and inline validation summaries.

Keep the existing In / Setup / Out tabs. In shows upstream schemas/sample values grouped by source and port. Setup groups Connection, Parameters and Options. Out shows the declared schema before a test and actual sample values after one. Name and Notes remain separate. Integrate naturally with the current visual system; do not redesign unrelated surfaces.

## Required platform nodes

Implement complete definitions for all existing platform nodes in `platform-nodes.ts`, `logic-nodes.ts`, `code-transform-nodes.ts`, and `notify-file-nodes.ts`.

### Triggers

- Manual: optional example payload/schema; outputs payload, triggeredAt, triggeredBy, runId.
- Schedule: interval type seconds/minutes/hours/days/weeks/months/custom Cron; interval count; day interval 1-31; weekly weekday choices; monthly day 1-31; hour choices Midnight, 1 AM-Noon, 1 PM-11 PM; minute 0-59; timezone; optional start/end; valid Cron; human summary and next-run preview. Outputs triggeredAt, scheduledFor, timezone, previousRunAt, nextRunAt, schedule.
- Webhook: GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS; validated unique path; authentication from saved credentials; respond immediately/when last node finishes/streaming; test and production URL behavior. Options: CORS, binary field name, ignore bots, IP allowlist, no response body, raw body, response code/data/headers, content type, body limit, path parameters and signature header where applicable. Outputs body, rawBody, headers, query, pathParams, method, path, ip, userAgent, binary, requestId, receivedAt.
- Email received and new attachment: credential/account, mailbox/folder, from/to/cc/subject/body/read/attachment filters and polling fallback. Outputs message/thread IDs, addresses, subject, text/html, headers, attachments and receivedAt.
- Form submitted and provider form triggers: credential/form resource and filters. Outputs submission/form IDs, typed answers, respondent and submittedAt.
- App event: credential, connected app, event and event-specific filters; output the event contract.
- RSS: URL, optional auth, interval, dedupe field, full-content option and age filter. Output feed and item metadata/content/enclosures.
- Inbound/outbound call: credential, number/route/status filters and recording/transcription options. Output call identity, parties, direction/status/times/duration/recording/transcript.
- Poll URL: HTTP configuration plus polling interval, comparison mode/path, first-check emission and dedupe. Output HTTP response plus previous/current values, changed paths and detectedAt.
- Database row, AI event, file event and notification triggers: add appropriate credential/resource/filter controls and domain-specific outputs including before/after data where relevant.

### Actions

- HTTP Request: credentials, method, URL, query, headers, body type/body, timeout, redirects, response type, pagination/binary options. Outputs status/statusText/headers/body/rawBody/binary/duration/finalUrl/ok.
- Download file: equivalent HTTP/auth handling; output binary, filename, MIME type, size and saved path.
- Email send/reply/forward: credential, correct message/thread fields, To/Cc/Bcc/Reply-To, subject, text/HTML body, attachments and sender. Outputs message/thread IDs, recipients, sentAt/status/ok.
- AI/Classify/Extract: credential/provider/model, system prompt, expression-aware prompt, temperature, max output, response format and timeout. Classify adds labels/multilabel/confidence/fallback. Extract uses the schema builder. Output model/provider/content or structured result, usage, finish reason, classification confidence or extraction validation, and ok.
- Database query/insert/update/delete: credential/resource selectors, structured mappings, query parameters, limits and mutation safeguards. Outputs rows/record, affected count, IDs and ok.
- Notification: meaningful delivery outputs.
- File plus copy/move/delete: operation-dependent fields for path, encoding, binary/content, overwrite, pattern/recursive and missing-file behavior; operation-specific outputs.
- Respond to webhook: status, response format/body/headers/binary/no-body; output response status, sentAt and ok.

### Logic

- If and Filter use the shared condition builder. If has stable True/False ports; Filter Pass/Drop. Both preserve input data and add match metadata.
- Switch and Paths use repeatable named cases/routes with stable IDs, dynamic ports and fallback. Renaming must not break edges.
- Delay supports duration, until timestamp or expression; units seconds/minutes/hours/days/weeks/months. Preserve input and output delay/resume metadata.
- Code supports JavaScript/Python, once-per-item/all-items, timeout, test console and optional declared schema. Infer/display output schema from test data without destroying a declared schema.
- Edit fields/Transform use structured add/replace/rename/remove/pick/omit mappings with type and dot-path handling; derive output schema when possible.
- Merge supports append, position, matching field, Cartesian, choose branch and wait-for-both with conditional fields and A/B/Out contracts.
- Loop supports array expression, batch size, concurrency, continue-on-item-error and max iterations. Each output includes item/index/batch/flags; Done includes accumulated results/count/failures.
- Formatter supports Text, Number, Date & Time, Boolean, Array, Object and Encoding operations with conditional parameters and typed output.

## Connector nodes

Cover every method produced by `packages/integrations`.

- Slack, Discord and Microsoft Teams: credential/resource inputs and domain message/channel/team/user/reaction/thread outputs.
- Google Sheets: spreadsheet/sheet resources, row lookup/number and structured column mappings; output row object, row number, range and affected count.
- Drive/Docs: folder/file/document resources, binary upload or typed content; output IDs, URL, metadata and ok.
- GitHub: repository/branch/tag/issue/PR resources as appropriate; separate issue/comment/PR/merge/commit/release outputs.
- Notion/Airtable: resource selectors with custom-ID fallback, schema-aware property mapping, meaningful page/record outputs.
- Expand reusable family factories for CRM (HubSpot, Salesforce, Pipedrive, Zoho CRM, Attio), Payments (Stripe, PayPal, Square), Calendar (Google/Outlook), Forms (Typeform, Google Forms, SurveyMonkey), and Tickets (Zendesk, Intercom, Help Scout, Front). Define common contracts plus provider overrides. Do not display misleading Zendesk-shaped statuses for all ticket providers without explicit mappings.

## Shared execution options

Support declaratively where appropriate: Only Run If, retry, attempts, delay/backoff, timeout, continue on failure, always output data, error output, rate-limit behavior, per-item/all-items, raw response, pagination/return-all/max items. `Only Run If` is shared, not Webhook-specific.

## Validation and ports

Implement required, integer/range, URL, JSON, email, Cron, regex, date-ordering, conditional, credential/resource, expression-reference, unique webhook path, unique route name, and destructive-operation validation. Errors appear beside fields and block Test/Deploy where appropriate.

Node definitions are the source of truth for ports. Dynamic route ports use persistent IDs. Logic and multi-input nodes retain their specialized topology.

## Tests and finish criteria

Add/update tests for schema completeness, explicit outputs, validation, conditional controls, expression chip serialization and missing references, secret masking, schedule ranges, unary conditions, dynamic port stability, dynamic output schemas, connector-family coverage and saved-workflow migration.

Run the most relevant focused tests while developing, then the repository's workflow/integration test suites, typecheck, and build if scripts exist. Do not use a browser. Fix regressions caused by the work. Review the final diff for incomplete catalog coverage, accidental secrets, and unrelated changes.

Because the scope is broad, prioritize a coherent production-grade schema and renderer over shallow bespoke forms. Do not stop after only Schedule/Webhook/If; migrate the entire current catalog and generated integration families. At the end, report changed files, architectural decisions, test results, and any genuine backend/runtime gaps that cannot be completed in this frontend/mock repository.
