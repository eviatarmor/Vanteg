import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function pageField(label = "Page ID", placeholder = "Tasks"): MethodField {
  return field("page", label, placeholder, {
    help: "Notion page id or title (resource select later).",
  })
}

function databaseField(placeholder = "Tasks"): MethodField {
  return field("database", "Database ID", placeholder, {
    help: "Notion database id or name (resource select later).",
  })
}

function propertiesField(
  placeholder = '{\n  "Status": "Done"\n}'
): MethodField {
  return field("properties", "Properties", placeholder, {
    control: "code",
    language: "json",
    help: "Page or database properties as a JSON object.",
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
      pageField("Page or database ID"),
    ]),
    method("notion-new-page", "trigger", "New page", "Start when a Notion page is created.", [
      pageField("Parent page or database ID"),
    ]),
    method("notion-new-database-item", "trigger", "New database item", "Start when a Notion database row is added.", [
      databaseField(),
    ]),
    method("notion", "action", "Create page", "Create or update a Notion page or database row.", [
      pageField("Page or database ID"),
      propertiesField(),
      contentField("Status: done"),
    ]),
    method("notion-update-page", "action", "Update page", "Update a Notion page.", [
      pageField(),
      contentField("Status: done"),
    ]),
    method("notion-create-database-item", "action", "Create database item", "Add a row to a Notion database.", [
      databaseField(),
      field("title", "Title", "Follow up"),
      propertiesField('{\n  "Status": "Todo"\n}'),
    ]),
    method("notion-update-database-item", "action", "Update database item", "Update a Notion database row.", [
      databaseField(),
      field("itemId", "Item ID", "abc123"),
      propertiesField(),
    ]),
    method("notion-archive-page", "action", "Archive page", "Archive or delete a Notion page.", [
      pageField(),
    ]),
  ],
})
