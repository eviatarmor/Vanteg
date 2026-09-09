import { useState } from "react"
import { Plug } from "lucide-react"

import type { CustomCredential } from "@workspace/integrations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import { useIntegrationsStore } from "./model/store"
import type { Connector } from "./model/types"
import { integrationTabs } from "./tabs"
import { ConnectConnectorDialog } from "./ui/ConnectConnectorDialog"
import { ConfiguredConnectors } from "./ui/ConfiguredConnectors"
import { ConnectorCatalog } from "./ui/ConnectorCatalog"
import { CustomCredentialDialog } from "./ui/CustomCredentialDialog"
import { CustomCredentials } from "./ui/CustomCredentials"
import { DeleteCustomCredentialDialog } from "./ui/DeleteCustomCredentialDialog"

export function IntegrationsPage() {
  const { title, subtitle } = getPageCopy("/integrations")
  const snapshot = useIntegrationsStore()
  const [pending, setPending] = useState<Connector | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [credentialOpen, setCredentialOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<CustomCredential | null>(null)
  const [deletingCredential, setDeletingCredential] = useState<CustomCredential | null>(null)

  function openPicker() {
    setPickerOpen(true)
  }

  function openCreateCredential() {
    setEditingCredential(null)
    setCredentialOpen(true)
  }

  function openEditCredential(credential: CustomCredential) {
    setEditingCredential(credential)
    setCredentialOpen(true)
  }

  function pickConnector(connector: Connector) {
    const existing = snapshot.connections.find((item) => item.connectorId === connector.id)
    setPickerOpen(false)
    if (existing) {
      return
    }
    setPending(connector)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTabs
        title={title}
        subtitle={subtitle}
        icon={Plug}
        tabs={integrationTabs}
        onNew={(tab) => {
          if (tab.id === "custom-credentials") {
            openCreateCredential()
            return
          }
          openPicker()
        }}
        renderPanel={(tab) => {
          if (tab.id === "custom-credentials") {
            return (
              <CustomCredentials
                onCreate={openCreateCredential}
                onEdit={openEditCredential}
                onDelete={setDeletingCredential}
              />
            )
          }
          return <ConfiguredConnectors onAdd={openPicker} />
        }}
      />
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-5xl xl:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Add connector</DialogTitle>
            <DialogDescription>Pick an app to connect.</DialogDescription>
          </DialogHeader>
          <ConnectorCatalog onPick={pickConnector} />
        </DialogContent>
      </Dialog>
      <ConnectConnectorDialog
        connector={pending}
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null)
          }
        }}
      />
      <CustomCredentialDialog
        open={credentialOpen}
        credential={editingCredential}
        onOpenChange={(open) => {
          setCredentialOpen(open)
          if (!open) {
            setEditingCredential(null)
          }
        }}
      />
      <DeleteCustomCredentialDialog
        credential={deletingCredential}
        open={deletingCredential !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCredential(null)
          }
        }}
      />
    </div>
  )
}
