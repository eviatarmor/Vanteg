# Integrations: actions and triggers

There are two catalogs.

The **Integrations page** has **152 connectable apps**. Each app is assigned a capability template, and that template’s **operations** are the actions you can run. Those apps do **not** have per-app trigger lists.

The **workflow editor** has **12 first-class connector apps** with named **triggers** and **actions**. Everything else in the 152-app catalog is meant to be reached from the generic **App event** trigger (`app` + `event`).

Sources:

- `client/src/features/integrations/model/catalog.ts`
- `client/src/features/workflows/model/node-catalog.ts`

---

## Workflow connectors (named triggers and actions)

### Slack

**Triggers:** New message · New reaction · New channel · App mentioned

**Actions:** Send message · Update message · Upload file · Add reaction

### GitHub

**Triggers:** New issue · Pull request opened · New commit · Release published

**Actions:** Create issue · Create comment · Create pull request · Add label

### Google (Sheets + Drive)

**Triggers:** New spreadsheet row · Updated spreadsheet row · New Drive file

**Actions:** Update row · Create row · Upload Drive file

### Notion

**Triggers:** Page updated · New page · New database item

**Actions:** Create page · Update page · Create database item

### Airtable

**Triggers:** New record · Record updated

**Actions:** Create record · Update record · Find records

### Discord

**Triggers:** New message · New reaction · Member joined

**Actions:** Send message · Update message · Add reaction

### HTTP

**Triggers:** Webhook · Poll URL

**Actions:** HTTP Request · Respond to webhook · Download file

### Email

**Triggers:** Email received · New attachment

**Actions:** Send email · Reply to email

### Database

**Triggers:** New row · Row updated

**Actions:** Query rows · Update row · Delete row

### AI

**Triggers:** Chat message received · Generation finished

**Actions:** AI (prompt) · Classify · Extract

### File

**Triggers:** File created · File updated

**Actions:** File (read/write) · Delete file · Copy file

### Notification

**Triggers:** Notification received · Notification clicked

**Actions:** Notification · Broadcast

### Platform triggers (not tied to one app)

Manual · Schedule · Form submitted · App event · RSS · Inbound call · Outbound call

---

## All 152 Integrations-page apps

Actions below are the template **operations**. There are no per-app triggers in this catalog.

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

### Google

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

### Microsoft

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

### Communication

| App | Actions |
|---|---|
| Slack | chat |
| Discord | chat |
| Telegram | chat |
| WhatsApp | sms |
| Twilio | sms |
| Zoom | event |
| Aircall | sms |

### Support

| App | Actions |
|---|---|
| Intercom | ticket |
| Front | ticket |
| Help Scout | ticket |
| Zendesk | ticket |
| Calendly | event |
| Typeform | form |
| SurveyMonkey | form |

### CRM

| App | Actions |
|---|---|
| HubSpot | crm |
| Salesforce | crm |
| Pipedrive | crm |
| Zoho CRM | crm |
| Attio | crm |

### Developer

| App | Actions |
|---|---|
| GitHub | issue |
| GitLab | issue |
| Bitbucket | issue |
| CircleCI | deploy |
| Jenkins | deploy |

### Project

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

### Payments

| App | Actions |
|---|---|
| Stripe | payment |
| PayPal | payment |
| Square | payment |
| Paddle | payment |
| Braintree | payment |
| Adyen | payment |

### Marketing

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

### Storage

| App | Actions |
|---|---|
| Airtable | sheet |
| Dropbox | file |
| Box | file |
| Amazon S3 | file |

### Databases

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

### AI

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

### Social

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

### Commerce

| App | Actions |
|---|---|
| Shopify | commerce |
| WooCommerce | commerce |
| Amazon | commerce |
| eBay | commerce |
| BigCommerce | commerce |
| Magento | commerce |

### Analytics

| App | Actions |
|---|---|
| Mixpanel | analytics |
| Amplitude | analytics |
| PostHog | analytics |
| Heap | analytics |
| Algolia | search |

### HR

| App | Actions |
|---|---|
| Workday | identity |
| Greenhouse | identity |
| Gusto | identity |
| Rippling | identity |
| Personio | identity |
| ADP | identity |

### Finance

| App | Actions |
|---|---|
| DocuSign | file |
| QuickBooks | payment |
| Xero | payment |
| Plaid | identity |

### Infra

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

### Design

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

### Auth

| App | Actions |
|---|---|
| 1Password | identity |
| Okta | identity |
| Auth0 | identity |
| Clerk | identity |

---

Slack in the workflow picker has eight named methods. Slack on the Integrations page is a **chat** connector, so its operations are **post / update / react**. Same product, two different catalogs.
