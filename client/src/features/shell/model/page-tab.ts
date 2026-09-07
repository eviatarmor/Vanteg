import { dataTabs } from "@/features/data/tabs"
import { memoryTabs } from "@/features/memory/tabs"
import { workflowTabs } from "@/features/workflows/tabs"

const tabbedPages = [
  { path: "/data", tabs: dataTabs },
  { path: "/memory", tabs: memoryTabs },
  { path: "/workflows", tabs: workflowTabs },
] as const

export function getActivePageTab(
  pathname: string,
  search = ""
): { pagePath: string; tabLabel: string } | null {
  const page = tabbedPages.find((entry) => entry.path === pathname)
  if (!page) {
    return null
  }
  const tabId = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  ).get("tab")
  const tab = page.tabs.find((item) => item.id === tabId) ?? page.tabs[0]
  if (!tab) {
    return null
  }
  return { pagePath: page.path, tabLabel: tab.label }
}
