# Integrations: actions and triggers

Canonical connector catalog lives in `@workspace/integrations` (`packages/integrations`).

`listApps()` returns **173** unique connectable apps (featured merged over long-tail). Of those:

| Slice | Count | How |
|---|---|---|
| **Featured** (`app.featured === true`) | **26** | Named triggers/actions for the workflow picker (`listFeaturedMethods` / `listPickerConnectorApps` → **24** picker groups; Google Sheets/Drive/Docs share the `google` group) |
| **Long-tail only** (`featured === false`) | **147** | Integrations-page connectors with template **operations** only — reached from the generic **App event** trigger (`app` + `event`) |

Sources:

- `packages/integrations/src/registry.ts` (`listApps`, `listFeaturedMethods`, `listPickerConnectorApps`)
- `packages/integrations/src/apps/` (featured definitions)
- `packages/integrations/src/long-tail.ts` (full Integrations-page set)
- `client/src/features/workflows/model/node-catalog.ts` (platform nodes + featured methods)

Credential and secret fields in connect / Setup UIs use **`SecretInput`** — see [UI conventions](./ui-conventions.md).

---

## Method field controls

Featured (and polished) method Setup fields use `MethodField.control` in `@workspace/integrations`:

| Control | Role |
|---|---|
| `select` | Fixed options (`options` on the field) |
| `textarea` | Multi-line text (bodies, content, values) |
| `resource` | Connection-scoped searchable picker (`resourceType`, e.g. `slack.channel`, `teams.team`, `teams.channel`) via `listResources` |
| `number` | Numeric amounts, counts, temperatures |
| `datetime` | Date-time values (calendar starts, delays, etc.) |

Also used: `input` (default short text), `code` (JS/JSON), and `boolean` on some platform nodes. Sheet templates separately use `FieldVariant` (`short-text`, `long-text`, `number`, `select`, `checkbox`, `date`, `url`).

---

## Featured workflow connectors

These **26** apps ship named **triggers** and **actions** (`featured: true`). Platform nodes (HTTP, Email, Database, AI, File, Notification, logic, etc.) sit beside them in `node-catalog.ts`.

### Slack

Channel fields use Setup `control: "resource"` with `resourceType: "slack.channel"` (searchable picker + custom value). See `listResources` in `@workspace/integrations`. Related kinds: `github.repo`, `sheets.sheet`, `discord.channel`, `notion.page`, `calendar.calendar`, `forms.form`, `teams.team`, `teams.channel`.

**Triggers:** New message · New reaction · New channel · App mentioned · User joined workspace

**Actions:** Send message · Update message · Upload file · Add reaction · Create channel · Remove reaction · Invite user to channel

### GitHub

**Triggers:** New issue · Pull request opened · Pull request merged · Pull request closed · Issue closed · New commit · Release published

**Actions:** Create issue · Create comment · Create pull request · Add label · Close issue · Merge pull request · Create release

### Google (Sheets + Drive + Docs)

**Sheets — Triggers:** New row · Updated row · **Actions:** Update row · Create row · Delete row

**Drive — Triggers:** New Drive file · New Drive folder · **Actions:** Upload Drive file

**Docs — Triggers:** New Google Doc · **Actions:** Create Google Doc

### Notion

**Triggers:** Page updated · New page · New database item

**Actions:** Create page · Update page · Create database item · Update database item · Archive page

### Airtable

**Triggers:** New record · Record updated · Record deleted

**Actions:** Create record · Update record · Find records · Delete record

### Discord

**Triggers:** New message · New reaction · Member joined · Member left

**Actions:** Send message · Update message · Add reaction · Delete message · Create channel

### Microsoft Teams

Team and channel fields use Setup `control: "resource"` with `resourceType: "teams.team"` / `"teams.channel"` (searchable picker + custom value). See `listResources` in `@workspace/integrations`.

**Triggers:** Message received · Channel created · Member added

**Actions:** Post message · Reply in thread · Update message · List channels · Create channel

### CRM (HubSpot · Salesforce · Pipedrive · Zoho CRM · Attio)

**Triggers:** New contact · New deal · Deal stage changed · Contact property updated · New company

**Actions:** Create contact · Update contact · Create deal · Update deal stage · Find contact by email

### Payments (Stripe · PayPal · Square)

**Triggers:** New charge · Payment failed · New subscription · Subscription cancelled · Refund issued · Invoice paid

**Actions:** Create charge · Issue refund · Create customer · Create invoice · Cancel subscription

### Calendars (Google Calendar · Outlook Calendar)

**Triggers:** New event created · Event starting soon · Event updated · Event cancelled

**Actions:** Create event · Update event · Add attendee · Delete event

### Forms (Typeform · Google Forms · SurveyMonkey)

**Triggers:** New submission · Form updated

**Actions:** List responses · Get form · Notify respondent

### Tickets (Zendesk · Intercom · Help Scout · Front)

**Triggers:** New ticket · Ticket status changed · New reply on ticket · Ticket assigned

**Actions:** Create ticket · Update ticket status · Add reply · Assign ticket

### Platform nodes (not `IntegrationApp` featured rows)

**HTTP — Triggers:** Webhook · Poll URL · **Actions:** HTTP Request · Respond to webhook · Download file

**Email — Triggers:** Email received · New attachment · **Actions:** Send email · Reply to email

**Database — Triggers:** New row · Row updated · **Actions:** Query rows · Update row · Delete row

**AI — Triggers:** Chat message received · Generation finished · **Actions:** AI (prompt) · Classify · Extract

**File — Triggers:** File created · File updated · **Actions:** File (read/write) · Delete file · Copy file

**Notification — Triggers:** Notification received · Notification clicked · **Actions:** Notification · Broadcast

### Platform triggers (not tied to one app)

Manual · Schedule · Form submitted · App event · RSS · Inbound call · Outbound call

---

## All 173 Integrations-page apps

Actions below are the template **operations**. Long-tail apps have no per-app trigger lists in this catalog; featured apps also expose the named methods above.

### Operation sets (by template)

| Template | Actions |
|---|---|
| **sheet** | append, update, read, clear |
| **email** | send, reply, draft |
| **chat** | post, update, react |
| **crm** | create, update, upsert, get |
| **issue** | create, update, comment |
| **file** | upload, list, download, delete |
| **calendar** | create, update, list |
| **payment** | create, capture, refund |
| **ai** | generate, embed, moderate |
| **db** | insert, update, select, delete |
| **event** | create, cancel, list |
| **sms** | send, status |
| **analytics** | track, identify, group |
| **identity** | create, update, disable |
| **commerce** | create / update / fulfill on order, product, or customer |
| **ticket** | create, update, reply |
| **form** | submit, list |
| **deploy** | deploy, promote, rollback |
| **search** | upsert, search, delete |

### Google (15)

| App | Actions |
|---|---|
| Google Sheets | sheet |
| Gmail | email |
| Google Drive | file |
| Google Calendar | calendar |
| Google Docs | file |
| Google Contacts | crm |
| Google Chat | chat |
| Google Tasks | issue |
| Google Analytics | analytics |
| YouTube | file |
| Google Ads | analytics |
| Google Meet | event |
| BigQuery | db |
| Cloud Storage | file |
| Google Forms | form |

### Microsoft (10)

| App | Actions |
|---|---|
| Outlook Mail | email |
| Outlook Calendar | calendar |
| Microsoft Teams | chat |
| OneDrive | file |
| SharePoint | sheet |
| Excel Online | sheet |
| Microsoft To Do | issue |
| Microsoft Planner | issue |
| Dynamics 365 | crm |
| Azure DevOps | issue |

### Communication (7)

| App | Actions |
|---|---|
| Slack | chat |
| Discord | chat |
| Telegram | chat |
| WhatsApp | sms |
| Twilio | sms |
| Zoom | event |
| Aircall | sms |

### Support (10)

| App | Actions |
|---|---|
| Intercom | ticket |
| Front | ticket |
| Help Scout | ticket |
| Zendesk | ticket |
| Freshdesk | ticket |
| Calendly | event |
| Acuity Scheduling | event |
| Cal.com | event |
| Typeform | form |
| SurveyMonkey | form |

### CRM (5)

| App | Actions |
|---|---|
| HubSpot | crm |
| Salesforce | crm |
| Pipedrive | crm |
| Zoho CRM | crm |
| Attio | crm |

### Developer (5)

| App | Actions |
|---|---|
| GitHub | issue |
| GitLab | issue |
| Bitbucket | issue |
| CircleCI | deploy |
| Jenkins | deploy |

### Project (12)

| App | Actions |
|---|---|
| Linear | issue |
| Jira | issue |
| Confluence | file |
| Asana | issue |
| Trello | issue |
| ClickUp | issue |
| Notion | sheet |
| Monday.com | issue |
| Shortcut | issue |
| Basecamp | issue |
| Coda | sheet |
| Todoist | issue |

### Payments (6)

| App | Actions |
|---|---|
| Stripe | payment |
| PayPal | payment |
| Square | payment |
| Paddle | payment |
| Braintree | payment |
| Adyen | payment |

### Marketing (12)

| App | Actions |
|---|---|
| Mailchimp | crm |
| Mailgun | email |
| Postmark | email |
| Resend | email |
| SendGrid | email |
| Brevo | email |
| Customer.io | analytics |
| Braze | analytics |
| Klaviyo | analytics |
| ActiveCampaign | crm |
| Segment | analytics |
| Iterable | analytics |

### Storage (4)

| App | Actions |
|---|---|
| Airtable | sheet |
| Dropbox | file |
| Box | file |
| Amazon S3 | file |

### Databases (13)

| App | Actions |
|---|---|
| PostgreSQL | db |
| MySQL | db |
| MongoDB | db |
| Redis | db |
| Snowflake | db |
| Supabase | db |
| Firebase | db |
| PlanetScale | db |
| Elasticsearch | search |
| Databricks | db |
| Microsoft SQL Server | db |
| Oracle DB | db |
| SQLite | db |

### AI (11)

| App | Actions |
|---|---|
| OpenAI | ai |
| Anthropic | ai |
| Google Gemini | ai |
| Hugging Face | ai |
| Replicate | ai |
| Cohere | ai |
| Mistral | ai |
| Groq | ai |
| Perplexity | ai |
| xAI | ai |
| Pinecone | search |

### Social (11)

| App | Actions |
|---|---|
| X | chat |
| LinkedIn | chat |
| Facebook | chat |
| Instagram | file |
| Reddit | chat |
| Pinterest | file |
| TikTok | file |
| Buffer | chat |
| Spotify | file |
| Threads | chat |
| Bluesky | chat |

### Commerce (6)

| App | Actions |
|---|---|
| Shopify | commerce |
| WooCommerce | commerce |
| Amazon | commerce |
| eBay | commerce |
| BigCommerce | commerce |
| Magento | commerce |

### Analytics (5)

| App | Actions |
|---|---|
| Mixpanel | analytics |
| Amplitude | analytics |
| PostHog | analytics |
| Heap | analytics |
| Algolia | search |

### HR (7)

| App | Actions |
|---|---|
| Workday | identity |
| Greenhouse | identity |
| Gusto | identity |
| Rippling | identity |
| Personio | identity |
| ADP | identity |
| BambooHR | identity |

### Finance (5)

| App | Actions |
|---|---|
| DocuSign | file |
| QuickBooks | payment |
| Xero | payment |
| Plaid | identity |
| PandaDoc | file |

### Infra (16)

| App | Actions |
|---|---|
| PagerDuty | ticket |
| Datadog | analytics |
| Sentry | ticket |
| Cloudflare | deploy |
| Vercel | deploy |
| Netlify | deploy |
| Heroku | deploy |
| DigitalOcean | deploy |
| Airbyte | deploy |
| New Relic | analytics |
| Grafana | analytics |
| Prometheus | analytics |
| AWS Lambda | deploy |
| AWS SNS | sms |
| AWS SQS | event |
| AWS EventBridge | event |

### Design (9)

| App | Actions |
|---|---|
| Figma | file |
| Canva | file |
| Miro | file |
| Webflow | sheet |
| Contentful | sheet |
| Sanity | sheet |
| Strapi | sheet |
| WordPress | file |
| Ghost | file |

### Auth (4)

| App | Actions |
|---|---|
| 1Password | identity |
| Okta | identity |
| Auth0 | identity |
| Clerk | identity |

---

Slack in the workflow picker has named methods from the featured app. Slack on the Integrations page is also a **chat** connector (operations **post / update / react**). Same product, two surfaces — featured methods vs template operations.
