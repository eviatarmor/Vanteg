/** True when typing into a field where global letter shortcuts should not fire. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']")
  )
}
