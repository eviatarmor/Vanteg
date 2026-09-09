export type IntegrationErrorCode =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "provider"
  | "webhook_invalid"
  | "conflict"
  | "internal"

export interface IntegrationError {
  code: IntegrationErrorCode
  message: string
  provider?: string
  fields?: Record<string, string>
  retryable?: boolean
  requestId?: string
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: IntegrationError }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err<T = never>(error: IntegrationError): Result<T> {
  return { ok: false, error }
}

export function isIntegrationError(value: unknown): value is IntegrationError {
  if (!value || typeof value !== "object") {
    return false
  }
  const candidate = value as Partial<IntegrationError>
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    [
      "validation",
      "unauthorized",
      "forbidden",
      "not_found",
      "rate_limited",
      "provider",
      "webhook_invalid",
      "conflict",
      "internal",
    ].includes(candidate.code)
  )
}
