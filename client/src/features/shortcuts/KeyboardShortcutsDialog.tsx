import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { listShortcutGroups } from "./model/shortcuts"

function KeyChord({ keys }: { keys: string[] }) {
  if (keys.length === 0) {
    return null
  }
  return (
    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
      {keys.map((key) => (
        <kbd
          key={key}
          className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const groups = listShortcutGroups()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription id="keyboard-shortcuts-description">
            Press{" "}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-sans text-[11px]">
              ?
            </kbd>{" "}
            anywhere outside a text field to open this list. Press Esc to close.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`shortcut-group-${group.id}`}>
              <h3
                id={`shortcut-group-${group.id}`}
                className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                {group.label}
              </h3>
              <ul className="grid gap-2">
                {group.shortcuts.map((shortcut) => (
                  <li
                    key={shortcut.id}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="text-foreground">{shortcut.description}</span>
                    <KeyChord keys={shortcut.keys} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
