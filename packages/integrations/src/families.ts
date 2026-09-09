import { field, integrationApp, method, selectField } from "./define.ts"
import type { AppAuth, ConnectorCategory, IntegrationApp, Method, MethodField, TemplateName } from "./types.ts"

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
  { value: "aud", label: "AUD" },
  { value: "cad", label: "CAD" },
] as const

const DEAL_STAGE_OPTIONS = [
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
] as const

const TICKET_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "hold", label: "On hold" },
  { value: "solved", label: "Solved" },
  { value: "closed", label: "Closed" },
] as const

function currencyField(placeholder = "usd"): MethodField {
  return selectField("currency", "Currency", placeholder, CURRENCY_OPTIONS)
}

function dealStageField(placeholder = "closed_won"): MethodField {
  return selectField("stage", "Stage", placeholder, DEAL_STAGE_OPTIONS)
}

function ticketStatusField(placeholder: string): MethodField {
  return selectField("status", "Status", placeholder, TICKET_STATUS_OPTIONS)
}

function crmFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-contact`, "trigger", "New contact", `Start when a ${name} contact is created.`, [
      field("list", "List", "all"),
    ]),
    method(`${prefix}-new-deal`, "trigger", "New deal", `Start when a ${name} deal is created.`, [
      field("pipeline", "Pipeline", "Sales"),
    ]),
    method(`${prefix}-deal-stage-changed`, "trigger", "Deal stage changed", `Start when a ${name} deal moves stage.`, [
      field("pipeline", "Pipeline", "Sales"),
      dealStageField(),
    ]),
    method(`${prefix}-contact-updated`, "trigger", "Contact property updated", `Start when a ${name} contact changes.`, [
      field("property", "Property", "email"),
    ]),
    method(`${prefix}-new-company`, "trigger", "New company", `Start when a ${name} company is created.`, [
      field("list", "List", "all"),
    ]),
    method(`${prefix}-create-contact`, "action", "Create contact", `Create a ${name} contact.`, [
      field("email", "Email", "ada@acme.com"),
      field("name", "Name", "Ada Lovelace"),
    ]),
    method(`${prefix}-update-contact`, "action", "Update contact", `Update a ${name} contact.`, [
      field("id", "Contact ID", "123"),
      field("email", "Email", "ada@acme.com"),
    ]),
    method(`${prefix}-create-deal`, "action", "Create deal", `Create a ${name} deal.`, [
      field("name", "Name", "Acme renewal"),
      field("amount", "Amount", "12000"),
    ]),
    method(`${prefix}-update-deal-stage`, "action", "Update deal stage", `Move a ${name} deal to a stage.`, [
      field("id", "Deal ID", "456"),
      dealStageField(),
    ]),
    method(`${prefix}-find-contact`, "action", "Find contact by email", `Find a ${name} contact by email.`, [
      field("email", "Email", "ada@acme.com"),
    ]),
  ]
}

function paymentFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-charge`, "trigger", "New charge", `Start when a ${name} charge succeeds.`, [
      currencyField(),
    ]),
    method(`${prefix}-payment-failed`, "trigger", "Payment failed", `Start when a ${name} payment fails.`, [
      currencyField(),
    ]),
    method(`${prefix}-new-subscription`, "trigger", "New subscription", `Start when a ${name} subscription starts.`, [
      field("plan", "Plan", "pro"),
    ]),
    method(`${prefix}-subscription-cancelled`, "trigger", "Subscription cancelled", `Start when a ${name} subscription is cancelled.`, [
      field("plan", "Plan", "pro"),
    ]),
    method(`${prefix}-refund-issued`, "trigger", "Refund issued", `Start when a ${name} refund is issued.`, [
      currencyField(),
      field("chargeId", "Charge ID", "ch_123", {
        help: "Optional. Only fire for refunds on this charge.",
      }),
    ]),
    method(`${prefix}-invoice-paid`, "trigger", "Invoice paid", `Start when a ${name} invoice is paid.`, [
      currencyField(),
      field("customerId", "Customer ID", "cus_123", {
        help: "Optional. Only fire for invoices for this customer.",
      }),
      field("invoiceId", "Invoice ID", "in_123", {
        help: "Optional. Only fire for this invoice.",
      }),
    ]),
    method(`${prefix}-create-charge`, "action", "Create charge", `Create a ${name} charge.`, [
      field("amount", "Amount", "2000"),
      currencyField(),
    ]),
    method(`${prefix}-issue-refund`, "action", "Issue refund", `Refund a ${name} charge.`, [
      field("chargeId", "Charge ID", "ch_123"),
    ]),
    method(`${prefix}-create-customer`, "action", "Create customer", `Create a ${name} customer.`, [
      field("email", "Email", "ada@acme.com"),
    ]),
    method(`${prefix}-create-invoice`, "action", "Create invoice", `Create a ${name} invoice.`, [
      field("customerId", "Customer ID", "cus_123"),
      field("amount", "Amount", "2000"),
    ]),
    method(`${prefix}-cancel-subscription`, "action", "Cancel subscription", `Cancel a ${name} subscription.`, [
      field("subscriptionId", "Subscription ID", "sub_123"),
    ]),
  ]
}

function calendarFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-event`, "trigger", "New event created", `Start when a ${name} event is created.`, [
      field("calendar", "Calendar", "primary"),
    ]),
    method(`${prefix}-event-starting-soon`, "trigger", "Event starting soon", `Start a set time before a ${name} event.`, [
      field("calendar", "Calendar", "primary"),
      field("lead", "Lead time", "15m"),
    ]),
    method(`${prefix}-event-updated`, "trigger", "Event updated", `Start when a ${name} event changes.`, [
      field("calendar", "Calendar", "primary"),
    ]),
    method(`${prefix}-event-cancelled`, "trigger", "Event cancelled", `Start when a ${name} event is cancelled.`, [
      field("calendar", "Calendar", "primary"),
    ]),
    method(`${prefix}-create-event`, "action", "Create event", `Create a ${name} event.`, [
      field("calendar", "Calendar", "primary"),
      field("title", "Title", "Kickoff"),
      field("start", "Start", "2026-09-08T09:00"),
    ]),
    method(`${prefix}-update-event`, "action", "Update event", `Update a ${name} event.`, [
      field("eventId", "Event ID", "evt_123"),
      field("title", "Title", "Kickoff"),
    ]),
    method(`${prefix}-add-attendee`, "action", "Add attendee", `Add an attendee to a ${name} event.`, [
      field("eventId", "Event ID", "evt_123"),
      field("email", "Email", "ada@acme.com"),
    ]),
    method(`${prefix}-delete-event`, "action", "Delete event", `Delete a ${name} event.`, [
      field("eventId", "Event ID", "evt_123"),
    ]),
  ]
}

function formFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-submission`, "trigger", "New submission", `Start when a ${name} form is submitted.`, [
      field("formId", "Form ID", "contact-form"),
    ]),
    method(`${prefix}-form-updated`, "trigger", "Form updated", `Start when a ${name} form definition changes.`, [
      field("formId", "Form ID", "contact-form"),
    ]),
    method(`${prefix}-list-responses`, "action", "List responses", `List ${name} responses.`, [
      field("formId", "Form ID", "contact-form"),
    ]),
    method(`${prefix}-get-form`, "action", "Get form", `Read a ${name} form and its questions.`, [
      field("formId", "Form ID", "contact-form"),
    ]),
  ]
}

function ticketFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-ticket`, "trigger", "New ticket", `Start when a ${name} ticket is created.`, [
      field("inbox", "Inbox", "support"),
    ]),
    method(`${prefix}-ticket-status-changed`, "trigger", "Ticket status changed", `Start when a ${name} ticket changes status.`, [
      ticketStatusField("open"),
    ]),
    method(`${prefix}-new-reply`, "trigger", "New reply on ticket", `Start when someone replies on a ${name} ticket.`, [
      field("inbox", "Inbox", "support"),
    ]),
    method(`${prefix}-ticket-assigned`, "trigger", "Ticket assigned", `Start when a ${name} ticket is assigned.`, [
      field("assignee", "Assignee", "ada"),
    ]),
    method(`${prefix}-create-ticket`, "action", "Create ticket", `Create a ${name} ticket.`, [
      field("subject", "Subject", "Cannot log in"),
      field("body", "Body", "Customer cannot sign in.", { control: "textarea" }),
    ]),
    method(`${prefix}-update-ticket-status`, "action", "Update ticket status", `Update a ${name} ticket status.`, [
      field("ticketId", "Ticket ID", "42"),
      ticketStatusField("solved"),
    ]),
    method(`${prefix}-add-reply`, "action", "Add reply", `Reply on a ${name} ticket.`, [
      field("ticketId", "Ticket ID", "42"),
      field("body", "Reply", "We are looking into this.", { control: "textarea" }),
    ]),
    method(`${prefix}-assign-ticket`, "action", "Assign ticket", `Assign a ${name} ticket.`, [
      field("ticketId", "Ticket ID", "42"),
      field("assignee", "Assignee", "ada"),
    ]),
  ]
}

function familyApp(
  id: string,
  name: string,
  description: string,
  category: ConnectorCategory,
  iconSlug: string,
  sheetsTemplate: TemplateName,
  auth: AppAuth,
  methods: Method[]
): IntegrationApp {
  return integrationApp({
    id,
    name,
    description,
    category,
    iconSlug,
    auth,
    sheetsTemplate,
    methods,
  })
}

export function crmApp(
  id: string,
  name: string,
  description: string,
  iconSlug: string,
  auth: AppAuth
): IntegrationApp {
  return familyApp(id, name, description, "CRM", iconSlug, "crm", auth, crmFamily(id, name))
}

export function paymentApp(
  id: string,
  name: string,
  description: string,
  iconSlug: string,
  auth: AppAuth
): IntegrationApp {
  return familyApp(id, name, description, "Payments", iconSlug, "payment", auth, paymentFamily(id, name))
}

export function calendarApp(
  id: string,
  name: string,
  description: string,
  iconSlug: string,
  auth: AppAuth
): IntegrationApp {
  return familyApp(id, name, description, id.startsWith("outlook") ? "Microsoft" : "Google", iconSlug, "calendar", auth, calendarFamily(id, name))
}

export function formApp(
  id: string,
  name: string,
  description: string,
  category: ConnectorCategory,
  iconSlug: string,
  auth: AppAuth
): IntegrationApp {
  return familyApp(id, name, description, category, iconSlug, "form", auth, formFamily(id, name))
}

export function ticketApp(
  id: string,
  name: string,
  description: string,
  iconSlug: string,
  auth: AppAuth
): IntegrationApp {
  return familyApp(id, name, description, "Support", iconSlug, "ticket", auth, ticketFamily(id, name))
}
