import { beforeEach, describe, expect, it } from "vitest"

import {
  addTableColumn,
  addTableRow,
  createSecret,
  createTable,
  createVariable,
  deleteTableColumn,
  deleteTableRows,
  findTable,
  getDataSnapshot,
  hydrateDataStore,
  reorderTableColumn,
  resetDataStore,
  retryDataLoad,
  selectDatabaseNode,
  selectVariableGroup,
  setDataEmptyReady,
  setDataLoadError,
  setDataLoading,
  shiftTableColumn,
  updateTableColumn,
  updateTableRows,
} from "./store"

describe("data store", () => {
  beforeEach(() => {
    resetDataStore()
  })

  it("seeds production users as the selected table", () => {
    const snapshot = getDataSnapshot()
    const selected = findTable(snapshot.databases, snapshot.selectedTableId ?? "")

    expect(selected?.database.name).toBe("production")
    expect(selected?.schema.name).toBe("public")
    expect(selected?.table.name).toBe("users")
    expect(selected?.table.rows.map((row) => row.name)).toContain("Ada Lovelace")
    expect(selected?.table.columns.map((column) => column.name)).toEqual([
      "Name",
      "Email",
      "Role",
      "Active",
      "Created At",
      "Updated At",
    ])
    expect(selected?.table.rows[0]?.createdAt).toBe("2026-03-01T12:00:00.000Z")
    expect(selected?.table.rows[0]?.updatedAt).toBe("2026-04-01T12:00:00.000Z")
  })

  it("creates a table in the selected schema", () => {
    const table = createTable("sessions")
    const snapshot = getDataSnapshot()
    const created = findTable(snapshot.databases, table?.id ?? "")

    expect(created?.schema.id).toBe("schema-production-public")
    expect(created?.table.name).toBe("sessions")
    expect(snapshot.selectedTableId).toBe(table?.id)
  })

  it("adds a variable to the selected group", () => {
    selectVariableGroup("vars-staging")
    createVariable("FEATURE_FLAG")

    const group = getDataSnapshot().variableGroups.find((item) => item.id === "vars-staging")
    expect(group?.items.some((item) => item.key === "FEATURE_FLAG")).toBe(true)
  })

  it("adds a secret to the selected group", () => {
    createSecret("WEBHOOK_SECRET", "whsec")

    const group = getDataSnapshot().secretGroups.find((item) => item.id === "secrets-global")
    const created = group?.items.find((item) => item.key === "WEBHOOK_SECRET")
    expect(created?.value).toBe("whsec")
  })

  it("adds a variable with a value to the selected group", () => {
    createVariable("FEATURE_FLAG", "on")

    const group = getDataSnapshot().variableGroups.find((item) => item.id === "vars-global")
    const created = group?.items.find((item) => item.key === "FEATURE_FLAG")
    expect(created?.value).toBe("on")
  })

  it("adds a column to a table and fills existing rows", () => {
    const column = addTableColumn("table-users", {
      name: "Phone",
      variant: "short-text",
    })
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(column?.id).toBe("phone")
    expect(table?.columns.map((item) => item.name)).toContain("Phone")
    expect(table?.rows.every((row) => row.phone === "")).toBe(true)
  })

  it("stores a regex schema on text columns", () => {
    const column = addTableColumn("table-users", {
      name: "Handle",
      variant: "short-text",
      regex: "^[a-z]+$",
      textFormat: "plain",
    })

    expect(column?.regex).toBe("^[a-z]+$")
    expect(column?.textFormat).toBe("plain")
  })

  it("inserts a new column before created and updated timestamps", () => {
    addTableColumn("table-users", { name: "Phone", variant: "short-text" })
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.columns.map((column) => column.id)).toEqual([
      "name",
      "email",
      "role",
      "active",
      "phone",
      "createdAt",
      "updatedAt",
    ])
  })

  it("selects a table from the database tree", () => {
    selectDatabaseNode("table-orders")

    expect(getDataSnapshot().selectedTableId).toBe("table-orders")
    expect(getDataSnapshot().selectedSchemaId).toBe("schema-production-public")
  })

  it("deletes a table row by id", () => {
    deleteTableRows("table-users", ["user-ada"])
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.rows.map((row) => row.id)).toEqual(["user-grace", "user-alan"])
  })

  it("moves a column before another column", () => {
    reorderTableColumn("table-users", "email", "name")
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.columns.map((column) => column.id).slice(0, 2)).toEqual([
      "email",
      "name",
    ])
  })

  it("shifts a column one step right", () => {
    shiftTableColumn("table-users", "name", 1)
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.columns.map((column) => column.id).slice(0, 2)).toEqual([
      "email",
      "name",
    ])
  })

  it("moves a column to the end", () => {
    reorderTableColumn("table-users", "name", null)
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.columns.map((column) => column.id)).toEqual([
      "email",
      "role",
      "active",
      "createdAt",
      "updatedAt",
      "name",
    ])
  })

  it("updates a column name and type without changing its id", () => {
    const renamed = updateTableColumn("table-users", "name", {
      name: "Full name",
      variant: "short-text",
    })
    expect(renamed?.id).toBe("name")
    expect(findTable(getDataSnapshot().databases, "table-users")?.table.rows[0]?.name).toBe(
      "Ada Lovelace"
    )

    const column = updateTableColumn("table-users", "email", {
      name: "Work email",
      variant: "number",
    })
    const table = findTable(getDataSnapshot().databases, "table-users")?.table
    const updated = table?.columns.find((item) => item.id === "email")

    expect(column?.id).toBe("email")
    expect(updated?.name).toBe("Work email")
    expect(updated?.variant).toBe("number")
    expect(table?.rows[0]?.email).toBeNull()
  })

  it("does not update created at or updated at", () => {
    expect(
      updateTableColumn("table-users", "createdAt", {
        name: "Created",
        variant: "short-text",
      })
    ).toBeUndefined()
    expect(
      findTable(getDataSnapshot().databases, "table-users")?.table.columns.find(
        (column) => column.id === "createdAt"
      )?.name
    ).toBe("Created At")
  })

  it("deletes a table column and its cell values", () => {
    deleteTableColumn("table-users", "email")
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.columns.map((column) => column.id)).not.toContain("email")
    expect(table?.rows.some((row) => "email" in row)).toBe(false)
  })

  it("stamps new rows with created and updated timestamps", () => {
    const before = Date.now()
    const row = addTableRow("table-users")
    const after = Date.now()
    const created = Date.parse(String(row?.createdAt))
    const updated = Date.parse(String(row?.updatedAt))

    expect(created).toBeGreaterThanOrEqual(before)
    expect(created).toBeLessThanOrEqual(after)
    expect(row?.updatedAt).toBe(row?.createdAt)
    expect(updated).toBe(created)
  })

  it("keeps created at and refreshes updated at when a user field changes", () => {
    const table = findTable(getDataSnapshot().databases, "table-users")?.table
    const original = table?.rows.find((row) => row.id === "user-ada")
    expect(original).toBeDefined()

    updateTableRows("table-users", [
      ...(table?.rows ?? []).map((row) =>
        row.id === "user-ada" ? { ...row, email: "ada@updated.dev" } : row
      ),
    ])

    const next = findTable(getDataSnapshot().databases, "table-users")?.table?.rows.find(
      (row) => row.id === "user-ada"
    )
    expect(next?.createdAt).toBe(original?.createdAt)
    expect(next?.email).toBe("ada@updated.dev")
    expect(next?.updatedAt).not.toBe(original?.updatedAt)
    expect(Date.parse(String(next?.updatedAt))).toBeGreaterThan(
      Date.parse(String(original?.updatedAt))
    )
  })

  it("ignores edits to created at and updated at", () => {
    const table = findTable(getDataSnapshot().databases, "table-users")?.table
    const original = table?.rows.find((row) => row.id === "user-ada")

    updateTableRows("table-users", [
      ...(table?.rows ?? []).map((row) =>
        row.id === "user-ada"
          ? { ...row, createdAt: "1999-01-01T00:00:00.000Z", updatedAt: "1999-01-01T00:00:00.000Z" }
          : row
      ),
    ])

    const next = findTable(getDataSnapshot().databases, "table-users")?.table?.rows.find(
      (row) => row.id === "user-ada"
    )
    expect(next?.createdAt).toBe(original?.createdAt)
    expect(next?.updatedAt).toBe(original?.updatedAt)
  })

  it("does not delete created at or updated at columns", () => {
    deleteTableColumn("table-users", "createdAt")
    deleteTableColumn("table-users", "updatedAt")
    const table = findTable(getDataSnapshot().databases, "table-users")?.table

    expect(table?.columns.map((column) => column.id)).toEqual(
      expect.arrayContaining(["createdAt", "updatedAt"])
    )
  })

  it("hydrates only while loading and retries from error", () => {
    setDataLoading()
    expect(getDataSnapshot().loadState).toBe("loading")
    hydrateDataStore()
    expect(getDataSnapshot().loadState).toBe("ready")
    expect(getDataSnapshot().databases.length).toBeGreaterThan(0)

    setDataLoadError("boom")
    expect(getDataSnapshot().loadState).toBe("error")
    retryDataLoad()
    expect(getDataSnapshot().loadState).toBe("ready")
  })

  it("bootstraps a workspace database when creating the first table", () => {
    setDataEmptyReady()
    const table = createTable("sessions")
    expect(table?.name).toBe("sessions")
    expect(getDataSnapshot().databases[0]?.name).toBe("workspace")
    expect(getDataSnapshot().selectedTableId).toBe(table?.id)
  })

  it("bootstraps a Global group when creating the first variable or secret", () => {
    setDataEmptyReady()
    expect(createVariable("APP_URL", "https://vanteg.dev")?.key).toBe("APP_URL")
    expect(getDataSnapshot().variableGroups[0]?.name).toBe("Global")

    setDataEmptyReady()
    expect(createSecret("API_TOKEN", "secret")?.key).toBe("API_TOKEN")
    expect(getDataSnapshot().secretGroups[0]?.name).toBe("Global")
  })
})
