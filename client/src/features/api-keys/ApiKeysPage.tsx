import { KeyRound } from "lucide-react"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import { apiKeyTabs } from "./tabs"

export function ApiKeysPage() {
  const { title, subtitle } = getPageCopy("/api-keys")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTabs title={title} subtitle={subtitle} icon={KeyRound} tabs={apiKeyTabs} />
    </div>
  )
}
