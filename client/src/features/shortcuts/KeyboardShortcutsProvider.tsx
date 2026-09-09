import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog"
import { isEditableTarget } from "./model/is-editable-target"

type KeyboardShortcutsContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openShortcuts: () => void
}

const KeyboardShortcutsContext =
  createContext<KeyboardShortcutsContextValue | null>(null)

export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
  const value = useContext(KeyboardShortcutsContext)
  if (!value) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider")
  }
  return value
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openShortcuts = useCallback(() => setOpen(true), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      // Shift+/ produces "?" on common layouts; browsers usually report key as "?"
      if (event.key !== "?") {
        return
      }
      if (isEditableTarget(event.target)) {
        return
      }
      event.preventDefault()
      setOpen(true)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const value = useMemo(
    () => ({ open, setOpen, openShortcuts }),
    [open, openShortcuts]
  )

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    </KeyboardShortcutsContext.Provider>
  )
}
