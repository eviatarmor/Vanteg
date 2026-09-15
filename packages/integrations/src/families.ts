import {
  calendarEventOutputs,
  crmCompanyOutputs,
  crmContactOutputs,
  crmDealOutputs,
  formDefinitionOutputs,
  formListOutputs,
  formSubmissionOutputs,
  paymentChargeOutputs,
  paymentCustomerOutputs,
  paymentInvoiceOutputs,
  paymentRefundOutputs,
  paymentSubscriptionOutputs,
  ticketOutputs,
  ticketReplyOutputs,
} from "./contracts.ts"
import { field, integrationApp, method, selectField } from "./define.ts"
import type { AppAuth, ConnectorCategory, IntegrationApp, Method, MethodField, TemplateName } from "./types.ts"

const FILTER_ANY = "__any__"

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
  { value: "aud", label: "AUD" },
  { value: "cad", label: "CAD" },
] as const

const PIPELINE_OPTIONS = [
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "customer_success", label: "Customer success" },
  { value: "support", label: "Support" },
] as const

const DEAL_STAGE_OPTIONS = [
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
] as const

const ZENDESK_TICKET_STATUSES = [
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "hold", label: "On hold" },
  { value: "solved", label: "Solved" },
  { value: "closed", label: "Closed" },
] as const

const INTERCOM_TICKET_STATUSES = [
  { value: "open", label: "Open" },
  { value: "snoozed", label: "Snoozed" },
  { value: "closed", label: "Closed" },
] as const

const HELP_SCOUT_TICKET_STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
] as const

const FRONT_TICKET_STATUSES = [
  { value: "open", label: "Open" },
  { value: "archived", label: "Archived" },
  { value: "trashed", label: "Trashed" },
  { value: "spam", label: "Spam" },
] as const

export const TICKET_STATUSES: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  zendesk: ZENDESK_TICKET_STATUSES,
  intercom: INTERCOM_TICKET_STATUSES,
  "help-scout": HELP_SCOUT_TICKET_STATUSES,
  front: FRONT_TICKET_STATUSES,
}

function withAnyOption(
  options: readonly { value: string; label: string }[],
  anyLabel: string
): { value: string; label: string }[] {
  return [{ value: FILTER_ANY, label: anyLabel }, ...options]
}

function currencyFilterField(): MethodField {
  return selectField(
    "currency",
    "Currency",
    FILTER_ANY,
    withAnyOption(CURRENCY_OPTIONS, "Any currency"),
    { help: "Optional. Only fire for this currency." }
  )
}

function pipelineFilterField(): MethodField {
  return selectField(
    "pipeline",
    "Pipeline",
    FILTER_ANY,
    withAnyOption(PIPELINE_OPTIONS, "Any pipeline"),
    { help: "Optional. Only fire for this pipeline." }
  )
}

function pipelineActionField(placeholder = "sales"): MethodField {
  return selectField("pipeline", "Pipeline", placeholder, PIPELINE_OPTIONS)
}

function dealStageFilterField(): MethodField {
  return selectField(
    "stage",
    "Stage",
    FILTER_ANY,
    withAnyOption(DEAL_STAGE_OPTIONS, "Any stage"),
    { help: "Optional. Only fire for this stage." }
  )
}

function dealStageActionField(placeholder = "closed_won"): MethodField {
  return selectField("stage", "Stage", placeholder, DEAL_STAGE_OPTIONS)
}

function ticketStatusFilterField(
  options: readonly { value: string; label: string }[]
): MethodField {
  return selectField(
    "status",
    "Status",
    FILTER_ANY,
    withAnyOption(options, "Any status"),
    { help: "Optional. Only fire for this status." }
  )
}

function ticketStatusActionField(
  placeholder: string,
  options: readonly { value: string; label: string }[]
): MethodField {
  return selectField("status", "Status", placeholder, options)
}

function amountField(placeholder = "12000"): MethodField {
  return field("amount", "Amount", placeholder, {
    control: "number",
    help: "Numeric amount (for example 12000). Enter digits only.",
  })
}

function calendarField(placeholder = "primary"): MethodField {
  return field("calendar", "Calendar", placeholder, {
    control: "resource",
    resourceType: "calendar.calendar",
    help: "Pick a calendar from the connected account, or enter a custom calendar id.",
  })
}

function formField(placeholder = "contact-form"): MethodField {
  return field("formId", "Form ID", placeholder, {
    control: "resource",
    resourceType: "forms.form",
    help: "Pick a form from the connected account, or enter a custom form id.",
  })
}

function formMessageField(placeholder: string): MethodField {
  return field("message", "Message", placeholder, { control: "textarea" })
}

function crmFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-contact`, "trigger", "New contact", `Start when a ${name} contact is created.`, [
      field("list", "List", "all"),
    ], { outputs: crmContactOutputs }),
    method(`${prefix}-new-deal`, "trigger", "New deal", `Start when a ${name} deal is created.`, [
      pipelineFilterField(),
    ], { outputs: crmDealOutputs }),
    method(`${prefix}-deal-stage-changed`, "trigger", "Deal stage changed", `Start when a ${name} deal moves stage.`, [
      pipelineFilterField(),
      dealStageFilterField(),
    ], { outputs: crmDealOutputs }),
    method(`${prefix}-contact-updated`, "trigger", "Contact property updated", `Start when a ${name} contact changes.`, [
      field("property", "Property", "email"),
    ], { outputs: crmContactOutputs }),
    method(`${prefix}-new-company`, "trigger", "New company", `Start when a ${name} company is created.`, [
      field("list", "List", "all"),
    ], { outputs: crmCompanyOutputs }),
    method(`${prefix}-create-contact`, "action", "Create contact", `Create a ${name} contact.`, [
      field("email", "Email", "ada@acme.com", { mode: "either", validation: [{ kind: "email" }] }),
      field("name", "Name", "Ada Lovelace", { mode: "either" }),
    ], { outputs: crmContactOutputs }),
    method(`${prefix}-update-contact`, "action", "Update contact", `Update a ${name} contact.`, [
      field("id", "Contact ID", "123", { required: true, mode: "either" }),
      field("email", "Email", "ada@acme.com", { mode: "either", validation: [{ kind: "email" }] }),
    ], { outputs: crmContactOutputs }),
    method(`${prefix}-create-deal`, "action", "Create deal", `Create a ${name} deal.`, [
      field("name", "Name", "Acme renewal", { mode: "either" }),
      amountField(),
      pipelineActionField(),
      dealStageActionField("qualification"),
    ], { outputs: crmDealOutputs }),
    method(`${prefix}-update-deal-stage`, "action", "Update deal stage", `Move a ${name} deal to a stage.`, [
      field("id", "Deal ID", "456", { required: true, mode: "either" }),
      dealStageActionField(),
    ], { outputs: crmDealOutputs }),
    method(`${prefix}-find-contact`, "action", "Find contact by email", `Find a ${name} contact by email.`, [
      field("email", "Email", "ada@acme.com", { mode: "either", validation: [{ kind: "email" }] }),
    ], { outputs: crmContactOutputs }),
  ]
}

function paymentFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-charge`, "trigger", "New charge", `Start when a ${name} charge succeeds.`, [
      currencyFilterField(),
    ], { outputs: paymentChargeOutputs }),
    method(`${prefix}-payment-failed`, "trigger", "Payment failed", `Start when a ${name} payment fails.`, [
      currencyFilterField(),
    ], { outputs: paymentChargeOutputs }),
    method(`${prefix}-new-subscription`, "trigger", "New subscription", `Start when a ${name} subscription starts.`, [
      field("plan", "Plan", "pro"),
    ], { outputs: paymentSubscriptionOutputs }),
    method(`${prefix}-subscription-cancelled`, "trigger", "Subscription cancelled", `Start when a ${name} subscription is cancelled.`, [
      field("plan", "Plan", "pro"),
    ], { outputs: paymentSubscriptionOutputs }),
    method(`${prefix}-refund-issued`, "trigger", "Refund issued", `Start when a ${name} refund is issued.`, [
      currencyFilterField(),
      field("chargeId", "Charge ID", "ch_123", {
        help: "Optional. Only fire for refunds on this charge.",
      }),
    ], { outputs: paymentRefundOutputs }),
    method(`${prefix}-invoice-paid`, "trigger", "Invoice paid", `Start when a ${name} invoice is paid.`, [
      currencyFilterField(),
      field("customerId", "Customer ID", "cus_123", {
        help: "Optional. Only fire for invoices for this customer.",
      }),
      field("invoiceId", "Invoice ID", "in_123", {
        help: "Optional. Only fire for this invoice.",
      }),
    ], { outputs: paymentInvoiceOutputs }),
    method(`${prefix}-create-charge`, "action", "Create charge", `Create a ${name} charge.`, [
      field("amount", "Amount", "2000", { control: "number", required: true, mode: "either" }),
      field("currency", "Currency", "usd"),
    ], { outputs: paymentChargeOutputs }),
    method(`${prefix}-issue-refund`, "action", "Issue refund", `Refund a ${name} charge.`, [
      field("chargeId", "Charge ID", "ch_123", { required: true, mode: "either" }),
    ], { outputs: paymentRefundOutputs }),
    method(`${prefix}-create-customer`, "action", "Create customer", `Create a ${name} customer.`, [
      field("email", "Email", "ada@acme.com", { mode: "either", validation: [{ kind: "email" }] }),
    ], { outputs: paymentCustomerOutputs }),
    method(`${prefix}-create-invoice`, "action", "Create invoice", `Create a ${name} invoice.`, [
      field("customerId", "Customer ID", "cus_123", { required: true, mode: "either" }),
      field("amount", "Amount", "2000", { control: "number", mode: "either" }),
    ], { outputs: paymentInvoiceOutputs }),
    method(`${prefix}-cancel-subscription`, "action", "Cancel subscription", `Cancel a ${name} subscription.`, [
      field("subscriptionId", "Subscription ID", "sub_123", { required: true, mode: "either" }),
    ], { outputs: paymentSubscriptionOutputs }),
  ]
}

function calendarFamily(prefix: string, name: string): Method[] {
  const dateOrder = {
    control: "datetime" as const,
    validation: [{ kind: "dateOrder" as const, beforeKey: "start", afterKey: "until" }],
  }
  return [
    method(`${prefix}-new-event`, "trigger", "New event created", `Start when a ${name} event is created.`, [
      calendarField(),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-event-starting-soon`, "trigger", "Event starting soon", `Start a set time before a ${name} event.`, [
      calendarField(),
      field("lead", "Lead time", "15m"),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-event-updated`, "trigger", "Event updated", `Start when a ${name} event changes.`, [
      calendarField(),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-event-cancelled`, "trigger", "Event cancelled", `Start when a ${name} event is cancelled.`, [
      calendarField(),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-create-event`, "action", "Create event", `Create a ${name} event.`, [
      calendarField(),
      field("title", "Title", "Kickoff", { mode: "either" }),
      field("start", "Start", "2026-09-08T09:00", {
        ...dateOrder,
        help: "Event start time (ISO 8601 local or UTC).",
      }),
      field("until", "Until", "2026-09-08T10:00", {
        ...dateOrder,
        help: "Event end time (ISO 8601). Must be after start.",
      }),
      field("description", "Description", "Agenda and notes", { control: "textarea", mode: "either" }),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-update-event`, "action", "Update event", `Update a ${name} event.`, [
      field("eventId", "Event ID", "evt_123", { required: true, mode: "either" }),
      field("title", "Title", "Kickoff", { mode: "either" }),
      field("start", "Start", "2026-09-08T09:00", {
        ...dateOrder,
        help: "Event start time (ISO 8601 local or UTC).",
      }),
      field("until", "Until", "2026-09-08T10:00", {
        ...dateOrder,
        help: "Event end time (ISO 8601). Must be after start.",
      }),
      field("description", "Description", "Agenda and notes", { control: "textarea", mode: "either" }),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-add-attendee`, "action", "Add attendee", `Add an attendee to a ${name} event.`, [
      field("eventId", "Event ID", "evt_123", { required: true, mode: "either" }),
      field("email", "Email", "ada@acme.com", { mode: "either", validation: [{ kind: "email" }] }),
    ], { outputs: calendarEventOutputs }),
    method(`${prefix}-delete-event`, "action", "Delete event", `Delete a ${name} event.`, [
      field("eventId", "Event ID", "evt_123", {
        required: true,
        mode: "either",
        validation: [{ kind: "destructive" }],
      }),
    ], { outputs: calendarEventOutputs }),
  ]
}

function formFamily(prefix: string, name: string): Method[] {
  return [
    method(`${prefix}-new-submission`, "trigger", "New submission", `Start when a ${name} form is submitted.`, [
      formField(),
    ], { outputs: formSubmissionOutputs }),
    method(`${prefix}-form-updated`, "trigger", "Form updated", `Start when a ${name} form definition changes.`, [
      formField(),
    ], { outputs: formDefinitionOutputs }),
    method(`${prefix}-list-responses`, "action", "List responses", `List ${name} responses.`, [
      formField(),
    ], { outputs: formListOutputs }),
    method(`${prefix}-get-form`, "action", "Get form", `Read a ${name} form and its questions.`, [
      formField(),
    ], { outputs: formDefinitionOutputs }),
    method(`${prefix}-notify-respondent`, "action", "Notify respondent", `Send a follow-up message to a ${name} respondent.`, [
      formField(),
      formMessageField("Thanks for your response."),
    ], { outputs: formSubmissionOutputs }),
  ]
}

function ticketFamily(prefix: string, name: string): Method[] {
  const statuses = TICKET_STATUSES[prefix] ?? ZENDESK_TICKET_STATUSES
  const defaultStatus = statuses.find((item) => item.value === "solved")?.value
    ?? statuses.find((item) => item.value === "closed")?.value
    ?? statuses[0]!.value
  return [
    method(`${prefix}-new-ticket`, "trigger", "New ticket", `Start when a ${name} ticket is created.`, [
      field("inbox", "Inbox", "support"),
    ], { outputs: ticketOutputs }),
    method(`${prefix}-ticket-status-changed`, "trigger", "Ticket status changed", `Start when a ${name} ticket changes status.`, [
      ticketStatusFilterField(statuses),
    ], { outputs: ticketOutputs }),
    method(`${prefix}-new-reply`, "trigger", "New reply on ticket", `Start when someone replies on a ${name} ticket.`, [
      field("inbox", "Inbox", "support"),
    ], { outputs: ticketReplyOutputs }),
    method(`${prefix}-ticket-assigned`, "trigger", "Ticket assigned", `Start when a ${name} ticket is assigned.`, [
      field("assignee", "Assignee", "ada"),
    ], { outputs: ticketOutputs }),
    method(`${prefix}-create-ticket`, "action", "Create ticket", `Create a ${name} ticket.`, [
      field("subject", "Subject", "Cannot log in", { mode: "either" }),
      field("body", "Body", "Customer cannot sign in.", { control: "textarea", mode: "either" }),
    ], { outputs: ticketOutputs }),
    method(`${prefix}-update-ticket-status`, "action", "Update ticket status", `Update a ${name} ticket status.`, [
      field("ticketId", "Ticket ID", "42", { required: true, mode: "either" }),
      ticketStatusActionField(defaultStatus, statuses),
    ], { outputs: ticketOutputs }),
    method(`${prefix}-add-reply`, "action", "Add reply", `Reply on a ${name} ticket.`, [
      field("ticketId", "Ticket ID", "42", { required: true, mode: "either" }),
      field("body", "Reply", "We are looking into this.", { control: "textarea", mode: "either" }),
    ], { outputs: ticketReplyOutputs }),
    method(`${prefix}-assign-ticket`, "action", "Assign ticket", `Assign a ${name} ticket.`, [
      field("ticketId", "Ticket ID", "42", { required: true, mode: "either" }),
      field("assignee", "Assignee", "ada", { mode: "either" }),
    ], { outputs: ticketOutputs }),
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
