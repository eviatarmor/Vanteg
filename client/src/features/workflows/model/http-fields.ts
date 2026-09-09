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
    options: HTTP_METHODS.map((value) => ({ value, label: value })),
  }
}

export function httpUrlField(placeholder: string): NodeField {
  return { key: "url", label: "URL", placeholder }
}

export function httpQueryField(): NodeField {
  return {
    key: "query",
    label: "Query",
    placeholder: '{\n  "limit": "10"\n}',
    control: "textarea",
    help: "Query parameters as JSON object keys, or one key=value pair per line.",
  }
}

export function httpHeadersField(): NodeField {
  return {
    key: "headers",
    label: "Headers",
    placeholder: '{\n  "Accept": "application/json"\n}',
    control: "code",
    language: "json",
    help: "Request headers as a JSON object.",
  }
}

export function httpBodyField(): NodeField {
  return {
    key: "body",
    label: "Body",
    placeholder: '{ "ok": true }',
    control: "textarea",
    help: "Request body for methods that send one (POST, PUT, PATCH).",
  }
}

export function httpTimeoutField(): NodeField {
  return {
    key: "timeout",
    label: "Timeout (ms)",
    placeholder: "30000",
    help: "Optional request timeout in milliseconds.",
  }
}
