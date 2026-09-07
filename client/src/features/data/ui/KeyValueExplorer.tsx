import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Braces, Lock } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"

import {
  addKeyedRow,
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

export function KeyValueExplorer({ kind }: { kind: "variables" | "secrets" }) {
  const snapshot = useDataStore()
  const groups = kind === "variables" ? snapshot.variableGroups : snapshot.secretGroups
  const selectedId =
    kind === "variables" ? snapshot.selectedVariableGroupId : snapshot.selectedSecretGroupId
  const group = groups.find((item) => item.id === selectedId) ?? groups[0]
  const isSecret = kind === "secrets"

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
