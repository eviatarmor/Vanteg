import { SECRET_MASK } from "@/features/data/model/mask-secret"

import type { RunIoEntry } from "./run-types"

export function displayRunIoValue(entry: RunIoEntry): string {
  if (!entry.secret) {
    return entry.value
  }
  if (entry.value.length === 0) {
    return ""
  }
  return SECRET_MASK
}

export function summarizeRunIo(
  entries: readonly RunIoEntry[]
): Array<{ key: string; value: string }> {
  return entries.map((entry) => ({
    key: entry.key,
    value: displayRunIoValue(entry),
  }))
}
