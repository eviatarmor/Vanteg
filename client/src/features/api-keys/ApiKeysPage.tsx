import { useEffect, useState } from "react"
import { KeyRound } from "lucide-react"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import type { PageTab } from "@/features/page-tabs/types"
import { getPageCopy } from "@/features/shell/model/catalog"

import { hydrateApiKeys } from "./model/store"
import type { ApiKey } from "./model/types"
import { apiKeyTabs } from "./tabs"
import { ApiKeysPanel } from "./ui/ApiKeysPanel"
import { CreateApiKeyDialog } from "./ui/CreateApiKeyDialog"
import { RevokeApiKeyDialog } from "./ui/RevokeApiKeyDialog"

export function ApiKeysPage() {
  const { title, subtitle } = getPageCopy("/api-keys")
  const [createTab, setCreateTab] = useState<PageTab | null>(null)
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null)

  useEffect(() => {
    // Macrotask so the loading frame can paint (and tests can assert it)
    // before localStorage hydration resolves.
    const id = window.setTimeout(() => {
      hydrateApiKeys()
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTabs
        title={title}
        subtitle={subtitle}
        icon={KeyRound}
        tabs={apiKeyTabs}
        onNew={(tab) => setCreateTab(tab)}
        renderPanel={(tab) => (
          <ApiKeysPanel
            tab={tab}
            onCreate={() => setCreateTab(tab)}
            onRevoke={setRevokeKey}
          />
        )}
      />
      <CreateApiKeyDialog
        tab={createTab}
        open={createTab !== null}
        onOpenChange={(open) => {
          if (!open) setCreateTab(null)
        }}
      />
      <RevokeApiKeyDialog
        apiKey={revokeKey}
        open={revokeKey !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeKey(null)
        }}
      />
    </div>
  )
}
