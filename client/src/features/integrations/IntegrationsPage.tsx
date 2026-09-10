import { useCallback, useEffect, useState } from "react"
import { AlertCircle, Plug } from "lucide-react"

import type { CustomCredential } from "@workspace/integrations"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { PageTabs } from "@/features/page-tabs/PageTabs"
import { getPageCopy } from "@/features/shell/model/catalog"

import {
  humanizeIntegrationsLoadError,
  loadIntegrationsList,
  type IntegrationsLoadStatus,
} from "./model/load"
import { useIntegrationsStore } from "./model/store"
import type { Connector } from "./model/types"
import { integrationTabs } from "./tabs"
import { ConnectConnectorDialog } from "./ui/ConnectConnectorDialog"
import { ConfiguredConnectors } from "./ui/ConfiguredConnectors"
import { ConnectorCatalog } from "./ui/ConnectorCatalog"
import { CustomCredentialDialog } from "./ui/CustomCredentialDialog"
import { CustomCredentials } from "./ui/CustomCredentials"
import { DeleteCustomCredentialDialog } from "./ui/DeleteCustomCredentialDialog"
import { IntegrationsSkeleton } from "./ui/IntegrationsSkeleton"
import { AddMcpServerDialog, McpServers } from "./ui/McpServers"

export function IntegrationsPage() {
  const { title, subtitle } = getPageCopy("/integrations")
  const snapshot = useIntegrationsStore()
  const [pending, setPending] = useState<Connector | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [mcpOpen, setMcpOpen] = useState(false)
  const [credentialOpen, setCredentialOpen] = useState(false)
  const [editingCredential, setEditingCredential] =
    useState<CustomCredential | null>(null)
  const [deletingCredential, setDeletingCredential] =
    useState<CustomCredential | null>(null)
  const [status, setStatus] = useState<IntegrationsLoadStatus>("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback(() => {
    setStatus("loading")
    setErrorMessage(null)
    void loadIntegrationsList()
      .then(() => {
        setStatus("ready")
      })
      .catch((error: unknown) => {
        setStatus("error")
        setErrorMessage(humanizeIntegrationsLoadError(error))
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

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
    const existing = snapshot.connections.find(
      (item) => item.connectorId === connector.id
    )
    setPickerOpen(false)
    if (existing) {
      return
    }
    setPending(connector)
  }

  function renderConnectorsPanel() {
    if (status === "loading") {
      return <IntegrationsSkeleton />
    }
    if (status === "error") {
      return (
        <div
          role="alert"
          className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center"
        >
          <AlertCircle className="size-8 text-destructive" aria-hidden />
          <p className="mt-3 text-sm font-medium">Could not load connectors</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {errorMessage ?? humanizeIntegrationsLoadError(null)}
          </p>
          <Button
            type="button"
            className="mt-4"
            variant="outline"
            onClick={load}
          >
            Try again
          </Button>
        </div>
      )
    }
    return <ConfiguredConnectors onAdd={openPicker} />
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
          if (tab.id === "mcp-servers") {
            setMcpOpen(true)
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
          if (tab.id === "mcp-servers") {
            return <McpServers onAdd={() => setMcpOpen(true)} />
          }
          return renderConnectorsPanel()
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
      <AddMcpServerDialog open={mcpOpen} onOpenChange={setMcpOpen} />
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
