import { useEffect } from "react"
import { Database } from "lucide-react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import { createSecret, createTable, createVariable, hydrateDataStore } from "./model/store"
import { dataTabs } from "./tabs"
import { DatabaseExplorer } from "./ui/DatabaseExplorer"
import { KeyValueExplorer } from "./ui/KeyValueExplorer"

export function DataPage() {
  const { title, subtitle } = getPageCopy("/data")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Macrotask so a loading skeleton can paint before seed hydration resolves.
    const id = window.setTimeout(() => {
      hydrateDataStore()
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageTabs
        title={title}
        subtitle={subtitle}
        icon={Database}
        tabs={dataTabs}
        defaultTab={searchParams.get("tab") ?? undefined}
        panelClassName="flex min-h-0 min-w-0 overflow-hidden p-0"
        onCreate={(tab, name, value) => {
          if (tab.id === "database") {
            const table = createTable(name)
            if (table) {
              toast.success(`Created table ${table.name}`)
            } else {
              toast.error("Could not create table")
            }
            return
          }
          if (tab.id === "variables") {
            const item = createVariable(name, value ?? "")
            if (item) {
              toast.success(`Created variable ${item.key}`)
            } else {
              toast.error("Could not create variable")
            }
            return
          }
          const item = createSecret(name, value ?? "")
          if (item) {
            toast.success(`Created secret ${item.key}`)
          } else {
            toast.error("Could not create secret")
          }
        }}
        renderPanel={(tab, { openCreate }) => {
          if (tab.id === "database") {
            return <DatabaseExplorer onCreate={openCreate} />
          }
          if (tab.id === "variables") {
            return <KeyValueExplorer kind="variables" onCreate={openCreate} />
          }
          return <KeyValueExplorer kind="secrets" onCreate={openCreate} />
        }}
      />
    </div>
  )
}
