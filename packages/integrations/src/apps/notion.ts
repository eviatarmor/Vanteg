import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function pageField(label = "Page", placeholder = "Tasks"): MethodField {
  return field("page", label, placeholder, {
    control: "resource",
    resourceType: "notion.page",
    help: "Pick a Notion page from the connected workspace, or enter a custom page name.",
  })
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
    ]),
    method("notion-new-page", "trigger", "New page", "Start when a Notion page is created.", [
      pageField("Parent page or database"),
    ]),
    method("notion-new-database-item", "trigger", "New database item", "Start when a Notion database row is added.", [
      field("database", "Database", "Tasks"),
    ]),
    method("notion", "action", "Create page", "Create or update a Notion page or database row.", [
      pageField("Page or database"),
    ]),
    method("notion-update-page", "action", "Update page", "Update a Notion page.", [
      pageField(),
      field("content", "Content", "Status: done", { control: "textarea" }),
    ]),
    method("notion-create-database-item", "action", "Create database item", "Add a row to a Notion database.", [
      field("database", "Database", "Tasks"),
      field("title", "Title", "Follow up"),
    ]),
    method("notion-update-database-item", "action", "Update database item", "Update a Notion database row.", [
      field("database", "Database", "Tasks"),
      field("itemId", "Item ID", "abc123"),
    ]),
    method("notion-archive-page", "action", "Archive page", "Archive or delete a Notion page.", [
      pageField(),
    ]),
  ],
})
