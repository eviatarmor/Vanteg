import type { NodeField } from "./types"

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const

export function httpMethodField(placeholder: string): NodeField {
  return {
    key: "method",
    label: "Method",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: HTTP_METHODS.map((value) => ({ value, label: value })),
  }
}

export function httpUrlField(placeholder: string): NodeField {
  return {
    key: "url",
    label: "URL",
    placeholder,
    section: "parameters",
    mode: "either",
    required: true,
    validation: [{ kind: "url" }, { kind: "required" }],
  }
}

export function httpQueryField(): NodeField {
  return {
    key: "query",
    label: "Query",
    placeholder: '{\n  "limit": "10"\n}',
    control: "keyValue",
    section: "parameters",
    mode: "either",
    help: "Query parameters as key/value pairs. JSON from saved workflows still loads.",
  }
}

export function httpHeadersField(): NodeField {
  return {
    key: "headers",
    label: "Headers",
    placeholder: '{\n  "Accept": "application/json"\n}',
    control: "keyValue",
    section: "parameters",
    mode: "either",
    help: "Request headers as key/value pairs. JSON objects from saved workflows still load.",
  }
}

export function httpBodyTypeField(placeholder = "json"): NodeField {
  return {
    key: "bodyType",
    label: "Body type",
    placeholder,
    control: "select",
    section: "parameters",
    mode: "fixed",
    options: [
      { value: "none", label: "None" },
      { value: "json", label: "JSON" },
      { value: "form", label: "Form" },
      { value: "raw", label: "Raw" },
      { value: "binary", label: "Binary" },
    ],
    showWhen: { key: "method", equals: ["POST", "PUT", "PATCH"] },
  }
}

export function httpBodyField(): NodeField {
  return {
    key: "body",
    label: "Body",
    placeholder: '{ "ok": true }',
    control: "textarea",
    section: "parameters",
    mode: "either",
    help: "Request body for methods that send one (POST, PUT, PATCH).",
    showWhen: [
      { key: "method", equals: ["POST", "PUT", "PATCH"] },
      { key: "bodyType", notEquals: ["none", ""] },
    ],
  }
}

export function httpTimeoutField(): NodeField {
  return {
    key: "timeout",
    label: "Timeout (ms)",
    placeholder: "30000",
    control: "number",
    section: "options",
    defaultValue: "30000",
    validation: [{ kind: "integer" }, { kind: "min", value: 0 }],
    help: "Optional request timeout in milliseconds.",
  }
}

export function httpRedirectsField(): NodeField {
  return {
    key: "followRedirects",
    label: "Follow redirects",
    placeholder: "true",
    control: "boolean",
    section: "options",
    mode: "fixed",
  }
}

export function httpResponseTypeField(): NodeField {
  return {
    key: "responseType",
    label: "Response type",
    placeholder: "json",
    control: "select",
    section: "options",
    mode: "fixed",
    options: [
      { value: "json", label: "JSON" },
      { value: "text", label: "Text" },
      { value: "binary", label: "Binary" },
    ],
  }
}
