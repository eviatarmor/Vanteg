import type { NodeField } from "./types"

const EMAIL_RECIPIENT_HELP =
  "One or more email addresses, separated by commas."

export function emailToField(placeholder: string): NodeField {
  return {
    key: "to",
    label: "To",
    placeholder,
    section: "parameters",
    mode: "either",
    required: true,
    validation: [{ kind: "email" }, { kind: "required" }],
    help: EMAIL_RECIPIENT_HELP,
  }
}

export function emailCcField(placeholder = "cc@example.com"): NodeField {
  return {
    key: "cc",
    label: "Cc",
    placeholder,
    section: "parameters",
    mode: "either",
    validation: [{ kind: "email" }],
    help: EMAIL_RECIPIENT_HELP,
  }
}

export function emailSubjectField(placeholder: string): NodeField {
  return {
    key: "subject",
    label: "Subject",
    placeholder,
    section: "parameters",
    mode: "either",
  }
}

export function emailBodyField(placeholder: string, label = "Body"): NodeField {
  return {
    key: "body",
    label,
    placeholder,
    control: "textarea",
    section: "parameters",
    mode: "either",
  }
}

export function formIdField(placeholder = "contact-form"): NodeField {
  return {
    key: "formId",
    label: "Form ID",
    placeholder,
    section: "parameters",
    mode: "either",
    control: "resource",
    resourceType: "forms.form",
    help: "Form ID or slug from the form URL or settings (not the form title).",
  }
}
