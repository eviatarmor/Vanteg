import { getNodeType } from "./node-catalog"
import type { NodeField, WorkflowNodeType } from "./types"

const HTTP_AUTH_NODE_IDS = new Set([
  "http",
  "http-poll",
  "http-download",
  "webhook",
])

/** Shared custom-credential + optional inline secret fields for HTTP-style nodes. */
export function customCredentialAuthFields(options?: {
  inlineLabel?: string
  inlinePlaceholder?: string
  inlineHelp?: string
  credentialHelp?: string
}): NodeField[] {
  return [
    {
      key: "credentialId",
      label: "Credential",
      placeholder: "None",
      control: "credential",
      help:
        options?.credentialHelp ??
        "Prefer a saved custom credential over pasting secrets into this step.",
    },
    {
      key: "token",
      label: options?.inlineLabel ?? "Bearer token / API key",
      placeholder: options?.inlinePlaceholder ?? "Paste only if not using a credential",
      secret: true,
      inlineAuth: true,
      help:
        options?.inlineHelp ??
        "Inline secret used only when no custom credential is selected.",
    },
  ]
}

export function isInlineAuthSuperseded(
  field: NodeField,
  config: Record<string, string>
): boolean {
  return Boolean(field.inlineAuth && config.credentialId)
}

function authFieldsFor(catalogId: string): NodeField[] {
  if (catalogId === "webhook") {
    return customCredentialAuthFields({
      inlineLabel: "Shared secret",
      inlinePlaceholder: "Optional webhook verification secret",
      inlineHelp: "Inline secret used only when no custom credential is selected.",
      credentialHelp: "Optional credential used to verify inbound webhook requests.",
    })
  }
  if (HTTP_AUTH_NODE_IDS.has(catalogId)) {
    return customCredentialAuthFields()
  }
  return []
}

/** Catalog lookup that attaches custom-credential fields for HTTP auth nodes. */
export function getNodeTypeForEditor(id: string): WorkflowNodeType | undefined {
  const node = getNodeType(id)
  if (!node) {
    return undefined
  }
  const extra = authFieldsFor(id)
  if (extra.length === 0) {
    return node
  }
  if (node.fields.some((field) => field.key === "credentialId")) {
    return node
  }
  return { ...node, fields: [...node.fields, ...extra] }
}

export function nodeNeedsCustomCredential(catalogId: string): boolean {
  return HTTP_AUTH_NODE_IDS.has(catalogId)
}
