export type ShortcutGroup = {
  id: string
  label: string
  shortcuts: { id: string; keys: string[]; description: string }[]
}

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") {
    return true
  }
  return /Mac|iPhone|iPad/.test(navigator.userAgent)
}

/** Platform-aware search chord used in UI (⌘K / Ctrl+K). */
export function searchShortcutLabel(): string {
  return isApplePlatform() ? "⌘K" : "Ctrl+K"
}

export function listShortcutGroups(): ShortcutGroup[] {
  const search = searchShortcutLabel()
  return [
    {
      id: "general",
      label: "General",
      shortcuts: [
        {
          id: "search",
          keys: [search],
          description: "Focus search",
        },
        {
          id: "shortcuts-help",
          keys: ["?"],
          description: "Open keyboard shortcuts",
        },
        {
          id: "escape",
          keys: ["Esc"],
          description: "Close dialogs and menus",
        },
      ],
    },
    {
      id: "navigation",
      label: "Navigation",
      shortcuts: [
        {
          id: "sidebar-nav",
          keys: [],
          description: "Use the left sidebar to open Home, Inbox, Workflows, Agents, and other pages",
        },
      ],
    },
    {
      id: "workflow-editor",
      label: "Workflow editor",
      shortcuts: [
        {
          id: "delete-node",
          keys: ["Backspace", "Delete"],
          description: "Delete the selected node or edge",
        },
      ],
    },
  ]
}
