import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Braces, Lock } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import { ExplorerSkeleton, ResourceError } from "@/features/load-state/ResourceStatus"

import {
  addKeyedRow,
  retryDataLoad,
  selectSecretGroup,
  selectVariableGroup,
  setSecretItems,
  setVariableItems,
  useDataStore,
} from "../model/store"
import type { KeyValueItem } from "../model/types"
import type { ExplorerNode } from "./ExplorerTree"
import { ExplorerTree } from "./ExplorerTree"
import { FillDataGrid } from "./FillDataGrid"

function KeyValueReadyPanel({
  kind,
  onCreate,
}: {
  kind: "variables" | "secrets"
  onCreate?: () => void
}) {
  const snapshot = useDataStore()
  const isSecret = kind === "secrets"
  const groups = isSecret ? snapshot.secretGroups : snapshot.variableGroups
  const selectedId = isSecret
    ? snapshot.selectedSecretGroupId
    : snapshot.selectedVariableGroupId
  const group = groups.find((item) => item.id === selectedId) ?? groups[0]

  const columns = useMemo<ColumnDef<KeyValueItem>[]>(
    () => [
      {
        id: "key",
        accessorKey: "key",
        header: "Key",
        minSize: 160,
        size: 220,
        meta: { label: "Key", cell: { variant: "short-text" } },
      },
      {
        id: "value",
        accessorKey: "value",
        header: isSecret ? "Secret" : "Value",
        minSize: 200,
        size: 320,
        meta: {
          label: isSecret ? "Secret" : "Value",
          cell: { variant: isSecret ? "secret" : "short-text" },
        },
      },
    ],
    [isSecret]
  )

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={isSecret ? Lock : Braces}
        title={isSecret ? "No secrets yet" : "No variables yet"}
        description={
          isSecret
            ? "Store API tokens and credentials securely. Values stay masked in the grid."
            : "Add a workspace variable to share config across workflows and agents."
        }
        actionLabel={isSecret ? "New secret" : "New variable"}
        onCreate={onCreate}
        className="min-h-0 flex-1"
      />
    )
  }

  const nodes: ExplorerNode[] = groups.map((item) => ({
    id: item.id,
    label: item.name,
    icon: isSecret ? "secret" : "variable",
  }))

  function onSelect(id: string) {
    if (kind === "variables") {
      selectVariableGroup(id)
      return
    }
    selectSecretGroup(id)
  }

  function persist(items: KeyValueItem[]) {
    if (!group) {
      return
    }
    const next = items.map((item) => ({
      id: item.id,
      key: String(item.key ?? ""),
      value: String(item.value ?? ""),
    }))
    if (kind === "variables") {
      setVariableItems(group.id, next)
      return
    }
    setSecretItems(group.id, next)
  }

  return (
    <ResizableSidebar
      id={isSecret ? "data-secrets" : "data-variables"}
      sidebar={
        <ExplorerTree
          aria-label={isSecret ? "Secret groups" : "Variable groups"}
          className="min-h-0 min-w-0 flex-1"
          header={
            <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {isSecret ? "Secrets" : "Variables"}
            </div>
          }
          nodes={nodes}
          selectedId={group?.id}
          defaultExpanded={groups.map((item) => item.id)}
          onSelect={onSelect}
        />
      }
    >
      {group ? (
        <>
          <header className="flex h-10 shrink-0 items-center border-b px-4 text-sm">
            <span className="font-medium">{group.name}</span>
          </header>
          <FillDataGrid
            data={group.items}
            columns={columns}
            getRowId={(row) => row.id}
            onDataChange={persist}
            onRowAdd={() => {
              addKeyedRow(kind)
            }}
            onRowsDelete={(rows) => {
              persist(group.items.filter((item) => !rows.some((row) => row.id === item.id)))
            }}
          />
        </>
      ) : (
        <EmptyState
          icon={isSecret ? Lock : Braces}
          title={isSecret ? "Select a secret group" : "Select a variable group"}
          description={`Choose a group from the tree to edit ${isSecret ? "secrets" : "variables"}.`}
          className="min-h-0 flex-1"
        />
      )}
    </ResizableSidebar>
  )
}

export function KeyValueExplorer({
  kind,
  onCreate,
}: {
  kind: "variables" | "secrets"
  onCreate?: () => void
}) {
  const snapshot = useDataStore()
  const isSecret = kind === "secrets"

  if (snapshot.loadState === "loading") {
    return (
      <ExplorerSkeleton label={isSecret ? "Loading secrets" : "Loading variables"} />
    )
  }

  if (snapshot.loadState === "error") {
    return (
      <ResourceError
        title={isSecret ? "Could not load secrets" : "Could not load variables"}
        message={snapshot.loadError ?? "Something went wrong while loading data."}
        onRetry={() => retryDataLoad()}
      />
    )
  }

  return <KeyValueReadyPanel kind={kind} onCreate={onCreate} />
}
