import { notionPageOutputs } from "../contracts.ts"
import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function pageField(label = "Page", placeholder = "Tasks"): MethodField {
  return field("page", label, placeholder, {
    control: "resource",
    resourceType: "notion.page",
    help: "Pick a Notion page from the connected workspace, or enter a custom page name.",
  })
}

function databaseField(placeholder = "Tasks"): MethodField {
  return field("database", "Database", placeholder, {
    control: "resource",
    resourceType: "notion.database",
    help: "Pick a Notion database, or enter a custom database id.",
  })
}

function propertiesField(
  placeholder = '{\n  "Status": "Done"\n}'
): MethodField {
  return field("properties", "Properties", placeholder, {
    control: "mapping",
    mode: "either",
    help: "Map incoming fields onto Notion properties. JSON objects from saved workflows still load.",
  })
}

function contentField(placeholder: string): MethodField {
  return field("content", "Content", placeholder, { control: "textarea" })
}

export const notion = integrationApp({
  id: "notion",
  name: "Notion",
  description: "Create Notion pages and database rows.",
  category: "Project",
  iconSlug: "notion",
  auth: oauth("notion"),
  sheetsTemplate: "sheet",
  methods: [
    method("notion-page-updated", "trigger", "Page updated", "Start when a Notion page changes.", [
      pageField("Page or database"),
    ], { outputs: notionPageOutputs }),
    method("notion-new-page", "trigger", "New page", "Start when a Notion page is created.", [
      pageField("Parent page or database"),
    ], { outputs: notionPageOutputs }),
    method("notion-new-database-item", "trigger", "New database item", "Start when a Notion database row is added.", [
      databaseField(),
    ], { outputs: notionPageOutputs }),
    method("notion", "action", "Create page", "Create or update a Notion page or database row.", [
      pageField("Page or database"),
      propertiesField(),
      contentField("Status: done"),
    ], { outputs: notionPageOutputs }),
    method("notion-update-page", "action", "Update page", "Update a Notion page.", [
      pageField(),
      contentField("Status: done"),
    ], { outputs: notionPageOutputs }),
    method("notion-create-database-item", "action", "Create database item", "Add a row to a Notion database.", [
      databaseField(),
      field("title", "Title", "Follow up", { mode: "either" }),
      propertiesField('{\n  "Status": "Todo"\n}'),
    ], { outputs: notionPageOutputs }),
    method("notion-update-database-item", "action", "Update database item", "Update a Notion database row.", [
      databaseField(),
      field("itemId", "Item ID", "abc123", { required: true, mode: "either" }),
      propertiesField(),
    ], { outputs: notionPageOutputs }),
    method("notion-archive-page", "action", "Archive page", "Archive or delete a Notion page.", [
      pageField(),
    ], { outputs: notionPageOutputs }),
  ],
})
