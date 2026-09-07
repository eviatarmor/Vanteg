export const SECRET_MASK = "*****"

export function maskSecretLast(value: string): string {
  if (value.length === 0) {
    return ""
  }
  if (value.length === 1) {
    return value
  }
  return "*".repeat(value.length - 1) + value.slice(-1)
}

export function applySecretInput(previous: string, displayed: string): string {
  const previousMask = maskSecretLast(previous)
  if (displayed === previousMask) {
    return previous
  }
  if (displayed.length === 0) {
    return ""
  }
  if (displayed.startsWith(previousMask)) {
    return previous + displayed.slice(previousMask.length)
  }
  if (
    displayed.length < previous.length &&
    maskSecretLast(previous.slice(0, displayed.length)) === displayed
  ) {
    return previous.slice(0, displayed.length)
  }
  const head = displayed.slice(0, -1)
  if (head !== "" && [...head].every((char) => char === "*")) {
    return previous.slice(0, displayed.length)
  }
  return displayed
}
