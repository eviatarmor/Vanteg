import { useSearchParams } from "react-router"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import { createSecret, createTable, createVariable } from "./model/store"
import { dataTabs } from "./tabs"
import { DatabaseExplorer } from "./ui/DatabaseExplorer"
import { KeyValueExplorer } from "./ui/KeyValueExplorer"

export function DataPage() {
  const { title, subtitle } = getPageCopy("/data")
  const [searchParams] = useSearchParams()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTabs
        title={title}
        subtitle={subtitle}
        tabs={dataTabs}
        defaultTab={searchParams.get("tab") ?? undefined}
        panelClassName="flex overflow-hidden p-0"
        onCreate={(tab, name, value) => {
          if (tab.id === "database") {
            createTable(name)
            return
          }
          if (tab.id === "variables") {
            createVariable(name, value ?? "")
            return
          }
          createSecret(name, value ?? "")
        }}
        renderPanel={(tab) => {
          if (tab.id === "database") {
            return <DatabaseExplorer />
          }
          if (tab.id === "variables") {
            return <KeyValueExplorer kind="variables" />
          }
          return <KeyValueExplorer kind="secrets" />
        }}
      />
    </div>
  )
}
