import { field, integrationApp, method, oauth } from "../define.ts"

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
      field("page", "Page or database", "Tasks"),
    ]),
    method("notion-new-page", "trigger", "New page", "Start when a Notion page is created.", [
      field("page", "Parent page or database", "Tasks"),
    ]),
    method("notion-new-database-item", "trigger", "New database item", "Start when a Notion database row is added.", [
      field("database", "Database", "Tasks"),
    ]),
    method("notion", "action", "Create page", "Create or update a Notion page or database row.", [
      field("page", "Page or database", "Tasks"),
    ]),
    method("notion-update-page", "action", "Update page", "Update a Notion page.", [
      field("page", "Page", "Tasks"),
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
      field("page", "Page", "Tasks"),
    ]),
  ],
})
