import { apiKey, oauth } from "../define.ts"
import { calendarApp, crmApp, formApp, paymentApp, ticketApp } from "../families.ts"

export const familyApps = [
  crmApp("hubspot", "HubSpot", "Create HubSpot contacts and deals.", "hubspot", oauth("hubspot", [
    "crm.objects.contacts.read",
    "crm.objects.contacts.write",
    "crm.objects.companies.write",
    "crm.objects.deals.read",
    "crm.objects.deals.write",
  ])),
  crmApp("salesforce", "Salesforce", "Create Salesforce records.", "salesforce", oauth("salesforce", ["api", "refresh_token"])),
  crmApp("pipedrive", "Pipedrive", "Create Pipedrive deals and people.", "pipedrive", oauth("pipedrive", ["deals:full", "contacts:full"])),
  crmApp("zoho-crm", "Zoho CRM", "Create Zoho CRM records.", "zoho", oauth("zoho", ["ZohoCRM.modules.ALL"])),
  crmApp("attio", "Attio", "Create Attio people and companies.", "attio", apiKey),
  paymentApp("stripe", "Stripe", "Create customers, invoices, and charges.", "stripe", apiKey),
  paymentApp("paypal", "PayPal", "Create PayPal payments.", "paypal", oauth("paypal", ["https://uri.paypal.com/services/payments/payment"])),
  paymentApp("square", "Square", "Create Square payments.", "square", oauth("square", ["PAYMENTS_WRITE", "ORDERS_WRITE"])),
  calendarApp("google-calendar", "Google Calendar", "Create and update calendar events.", "google-calendar", oauth("google", ["https://www.googleapis.com/auth/calendar"])),
  calendarApp("outlook-calendar", "Outlook Calendar", "Create Outlook calendar events.", "microsoft-outlook", oauth("microsoft", ["Calendars.ReadWrite"])),
  formApp("typeform", "Typeform", "Collect Typeform responses.", "Support", "typeform", oauth("typeform", ["forms:write", "responses:read"])),
  formApp("google-forms", "Google Forms", "Collect form responses.", "Google", "google-forms", oauth("google", ["https://www.googleapis.com/auth/forms.body"])),
  formApp("surveymonkey", "SurveyMonkey", "Collect SurveyMonkey responses.", "Support", "surveymonkey", oauth("surveymonkey")),
  ticketApp("zendesk", "Zendesk", "Create and update Zendesk tickets.", "zendesk", oauth("zendesk", ["tickets:write", "users:write", "read"])),
  ticketApp("intercom", "Intercom", "Create Intercom conversations.", "intercom", oauth("intercom")),
  ticketApp("help-scout", "Help Scout", "Create Help Scout conversations.", "helpscout", oauth("helpscout")),
  ticketApp("front", "Front", "Create Front conversations.", "front", oauth("front")),
]
