import type { NodeField } from "./types"

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
