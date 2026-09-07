import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { PageHeader } from "@/features/page-header/PageHeader"
import { getPageCopy } from "@/features/shell/model/catalog"

import { useIntegrationsStore } from "./model/store"
import type { Connector } from "./model/types"
import { ConnectConnectorDialog } from "./ui/ConnectConnectorDialog"
import { ConfiguredConnectors } from "./ui/ConfiguredConnectors"
import { ConnectorCatalog } from "./ui/ConnectorCatalog"

export function IntegrationsPage() {
  const { title, subtitle } = getPageCopy("/integrations")
  const snapshot = useIntegrationsStore()
  const [pending, setPending] = useState<Connector | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  function openPicker() {
    setPickerOpen(true)
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
      <PageHeader
        title={title}
        subtitle={subtitle}
        className="border-b"
        action={
          <Button size="sm" onClick={openPicker}>
            <Plus />
            Add connector
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 py-6">
        <ConfiguredConnectors onAdd={openPicker} />
      </div>
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
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
    </div>
  )
}
