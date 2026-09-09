import { Brain } from "lucide-react"
import { useSearchParams } from "react-router"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import { createKnowledgeBase, createMemoryBase } from "./model/store"
import { memoryTabs } from "./tabs"
import { KnowledgeBaseExplorer } from "./ui/KnowledgeBaseExplorer"
import { MemoryBaseExplorer } from "./ui/MemoryBaseExplorer"

export function MemoryPage() {
  const { title, subtitle } = getPageCopy("/memory")
  const [searchParams] = useSearchParams()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTabs
        title={title}
        subtitle={subtitle}
        icon={Brain}
        tabs={memoryTabs}
        defaultTab={searchParams.get("tab") ?? undefined}
        panelClassName="flex overflow-hidden p-0"
        onCreate={(tab, name) => {
          if (tab.id === "knowledge-bases") {
            createKnowledgeBase(name)
            return
          }
          createMemoryBase(name)
        }}
        renderPanel={(tab) => {
          if (tab.id === "knowledge-bases") {
            return <KnowledgeBaseExplorer />
          }
          return <MemoryBaseExplorer />
        }}
      />
    </div>
  )
}
