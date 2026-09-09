import type { NodeField } from "./types"

const EMAIL_RECIPIENT_HELP =
  "One or more email addresses, separated by commas."

export function emailToField(placeholder: string): NodeField {
  return {
    key: "to",
    label: "To",
    placeholder,
    help: EMAIL_RECIPIENT_HELP,
  }
}

export function emailCcField(placeholder = "cc@example.com"): NodeField {
  return {
    key: "cc",
    label: "Cc",
    placeholder,
    help: EMAIL_RECIPIENT_HELP,
  }
}

export function emailSubjectField(placeholder: string): NodeField {
  return {
    key: "subject",
    label: "Subject",
    placeholder,
  }
}

export function emailBodyField(placeholder: string, label = "Body"): NodeField {
  return {
    key: "body",
    label,
    placeholder,
    control: "textarea",
  }
}

export function formIdField(placeholder = "contact-form"): NodeField {
  return {
    key: "formId",
    label: "Form ID",
    placeholder,
    help: "Form ID or slug from the form URL or settings (not the form title).",
  }
}
