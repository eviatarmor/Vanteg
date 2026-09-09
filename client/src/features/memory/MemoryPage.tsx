import { useEffect } from "react"
import { Brain } from "lucide-react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import { createKnowledgeBase, createMemoryBase, hydrateMemoryStore } from "./model/store"
import { memoryTabs } from "./tabs"
import { KnowledgeBaseExplorer } from "./ui/KnowledgeBaseExplorer"
import { MemoryBaseExplorer } from "./ui/MemoryBaseExplorer"

export function MemoryPage() {
  const { title, subtitle } = getPageCopy("/memory")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const id = window.setTimeout(() => {
      hydrateMemoryStore()
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

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
            const base = createKnowledgeBase(name)
            if (base) {
              toast.success(`Created knowledge base ${base.name}`)
            } else {
              toast.error("Could not create knowledge base")
            }
            return
          }
          const base = createMemoryBase(name)
          if (base) {
            toast.success(`Created memory base ${base.name}`)
          } else {
            toast.error("Could not create memory base")
          }
        }}
        renderPanel={(tab, { openCreate }) => {
          if (tab.id === "knowledge-bases") {
            return <KnowledgeBaseExplorer onCreate={openCreate} />
          }
          return <MemoryBaseExplorer onCreate={openCreate} />
        }}
      />
    </div>
  )
}
