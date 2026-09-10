import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Braces, Lock } from "lucide-react"

import { EmptyState } from "@/features/empty-state/EmptyState"
import { ResizableSidebar } from "@/features/layout/ResizableSidebar"
import {
  ExplorerSkeleton,
  ResourceError,
} from "@/features/load-state/ResourceStatus"

import {
  addKeyedRow,
  retryDataLoad,
  selectSecretGroup,
  selectVariableGroup,
  setSecretItems,
  setVariableItems,
  useDataStore,
} from "../model/store"
import type { KeyValueGroup, KeyValueItem } from "../model/types"
import type { ExplorerNode } from "./ExplorerTree"
import { ExplorerTree } from "./ExplorerTree"
import { FillDataGrid } from "./FillDataGrid"

type KeyValueKind = "variables" | "secrets"

function keyValueMeta(isSecret: boolean) {
  if (isSecret) {
    return {
      icon: Lock,
      emptyTitle: "No secrets yet",
      emptyDescription:
        "Store API tokens and credentials securely. Values stay masked in the grid.",
      actionLabel: "New secret",
      sidebarId: "data-secrets",
      treeLabel: "Secret groups",
      header: "Secrets",
      selectTitle: "Select a secret group",
      selectDescription: "Choose a group from the tree to edit secrets.",
      valueHeader: "Secret",
      cellVariant: "secret" as const,
    }
  }
  return {
    icon: Braces,
    emptyTitle: "No variables yet",
    emptyDescription:
      "Add a workspace variable to share config across workflows and agents.",
    actionLabel: "New variable",
    sidebarId: "data-variables",
    treeLabel: "Variable groups",
    header: "Variables",
    selectTitle: "Select a variable group",
    selectDescription: "Choose a group from the tree to edit variables.",
    valueHeader: "Value",
    cellVariant: "short-text" as const,
  }
}

function groupsForKind(
  snapshot: ReturnType<typeof useDataStore>,
  isSecret: boolean
) {
  if (isSecret) {
    return snapshot.secretGroups
  }
  return snapshot.variableGroups
}

function selectedGroupId(
  snapshot: ReturnType<typeof useDataStore>,
  isSecret: boolean
) {
  if (isSecret) {
    return snapshot.selectedSecretGroupId
  }
  return snapshot.selectedVariableGroupId
}

function resolveGroup(groups: KeyValueGroup[], selectedId: string) {
  const match = groups.find((item) => item.id === selectedId)
  if (match) {
    return match
  }
  return groups[0]
}

function keyValueColumns(isSecret: boolean): ColumnDef<KeyValueItem>[] {
  const meta = keyValueMeta(isSecret)
  return [
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
      header: meta.valueHeader,
      minSize: 200,
      size: 320,
      meta: {
        label: meta.valueHeader,
        cell: { variant: meta.cellVariant },
      },
    },
  ]
}

function toExplorerNodes(
  groups: KeyValueGroup[],
  isSecret: boolean
): ExplorerNode[] {
  const icon = isSecret ? "secret" : "variable"
  return groups.map((item) => ({
    id: item.id,
    label: item.name,
    icon,
  }))
}

function selectKeyValueGroup(kind: KeyValueKind, id: string) {
  if (kind === "variables") {
    selectVariableGroup(id)
    return
  }
  selectSecretGroup(id)
}

function persistKeyValueItems(
  kind: KeyValueKind,
  groupId: string,
  items: KeyValueItem[]
) {
  const next = items.map((item) => ({
    id: item.id,
    key: String(item.key ?? ""),
    value: String(item.value ?? ""),
  }))
  if (kind === "variables") {
    setVariableItems(groupId, next)
    return
  }
  setSecretItems(groupId, next)
}

function withoutRows(items: KeyValueItem[], rows: KeyValueItem[]) {
  const removed = new Set(rows.map((row) => row.id))
  return items.filter((item) => !removed.has(item.id))
}

function KeyValueEmptyGroups({
  isSecret,
  onCreate,
}: {
  isSecret: boolean
  onCreate?: () => void
}) {
  const meta = keyValueMeta(isSecret)
  return (
    <EmptyState
      icon={meta.icon}
      title={meta.emptyTitle}
      description={meta.emptyDescription}
      actionLabel={meta.actionLabel}
      onCreate={onCreate}
      className="min-h-0 flex-1"
    />
  )
}

function KeyValueSelectEmpty({ isSecret }: { isSecret: boolean }) {
  const meta = keyValueMeta(isSecret)
  return (
    <EmptyState
      icon={meta.icon}
      title={meta.selectTitle}
      description={meta.selectDescription}
      className="min-h-0 flex-1"
    />
  )
}

function KeyValueGroupEditor({
  group,
  kind,
  columns,
}: {
  group: KeyValueGroup
  kind: KeyValueKind
  columns: ColumnDef<KeyValueItem>[]
}) {
  function persist(items: KeyValueItem[]) {
    persistKeyValueItems(kind, group.id, items)
  }

  return (
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
          persist(withoutRows(group.items, rows))
        }}
      />
    </>
  )
}

function KeyValueGroupBody({
  group,
  isSecret,
  kind,
  columns,
}: {
  group: KeyValueGroup | undefined
  isSecret: boolean
  kind: KeyValueKind
  columns: ColumnDef<KeyValueItem>[]
}) {
  if (!group) {
    return <KeyValueSelectEmpty isSecret={isSecret} />
  }
  return <KeyValueGroupEditor group={group} kind={kind} columns={columns} />
}

function KeyValueReadyPanel({
  kind,
  onCreate,
}: {
  kind: KeyValueKind
  onCreate?: () => void
}) {
  const snapshot = useDataStore()
  const isSecret = kind === "secrets"
  const groups = groupsForKind(snapshot, isSecret)
  const selectedId = selectedGroupId(snapshot, isSecret)
  const group = resolveGroup(groups, selectedId)
  const meta = keyValueMeta(isSecret)

  const columns = useMemo<ColumnDef<KeyValueItem>[]>(
    () => keyValueColumns(isSecret),
    [isSecret]
  )

  if (groups.length === 0) {
    return <KeyValueEmptyGroups isSecret={isSecret} onCreate={onCreate} />
  }

  return (
    <ResizableSidebar
      id={meta.sidebarId}
      sidebar={
        <ExplorerTree
          aria-label={meta.treeLabel}
          className="min-h-0 min-w-0 flex-1"
          header={
            <div className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {meta.header}
            </div>
          }
          nodes={toExplorerNodes(groups, isSecret)}
          selectedId={group?.id}
          defaultExpanded={groups.map((item) => item.id)}
          onSelect={(id) => selectKeyValueGroup(kind, id)}
        />
      }
    >
      <KeyValueGroupBody
        group={group}
        isSecret={isSecret}
        kind={kind}
        columns={columns}
      />
    </ResizableSidebar>
  )
}

export function KeyValueExplorer({
  kind,
  onCreate,
}: {
  kind: KeyValueKind
  onCreate?: () => void
}) {
  const snapshot = useDataStore()
  const isSecret = kind === "secrets"

  if (snapshot.loadState === "loading") {
    return (
      <ExplorerSkeleton
        label={isSecret ? "Loading secrets" : "Loading variables"}
      />
    )
  }

  if (snapshot.loadState === "error") {
    return (
      <ResourceError
        title={isSecret ? "Could not load secrets" : "Could not load variables"}
        message={
          snapshot.loadError ?? "Something went wrong while loading data."
        }
        onRetry={() => retryDataLoad()}
      />
    )
  }

  return <KeyValueReadyPanel kind={kind} onCreate={onCreate} />
}
