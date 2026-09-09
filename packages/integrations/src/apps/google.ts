import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function sheetField(placeholder = "Leads"): MethodField {
  return field("sheet", "Sheet", placeholder, {
    control: "resource",
    resourceType: "sheets.sheet",
    help: "Pick a spreadsheet sheet from the connected Google account, or enter a custom sheet name.",
  })
}

export const googleSheets = integrationApp({
  id: "google-sheets",
  name: "Google Sheets",
  description: "Append, update, and read spreadsheet rows.",
  category: "Google",
  iconSlug: "google-sheets",
  auth: oauth("google", ["https://www.googleapis.com/auth/spreadsheets"]),
  sheetsTemplate: "sheet",
  pickerGroup: "google",
  methods: [
    method("spreadsheet-new-row", "trigger", "New row", "Start when a spreadsheet row is added.", [
      sheetField(),
    ]),
    method("spreadsheet-updated-row", "trigger", "Updated row", "Start when a spreadsheet row changes.", [
      sheetField(),
    ]),
    method("spreadsheet", "action", "Update row", "Create or update a spreadsheet row.", [
      sheetField(),
    ]),
    method("spreadsheet-create-row", "action", "Create row", "Append a spreadsheet row.", [
      sheetField(),
      field("values", "Values", "Ada, ada@acme.com", { control: "textarea" }),
    ]),
    method("spreadsheet-delete-row", "action", "Delete row", "Delete a spreadsheet row.", [
      sheetField(),
      field("row", "Row", "12"),
    ]),
  ],
})

export const googleDrive = integrationApp({
  id: "google-drive",
  name: "Google Drive",
  description: "Upload and list Drive files.",
  category: "Google",
  iconSlug: "google-drive",
  auth: oauth("google", ["https://www.googleapis.com/auth/drive"]),
  sheetsTemplate: "file",
  pickerGroup: "google",
  methods: [
    method("google-drive-new-file", "trigger", "New Drive file", "Start when a file is added to Google Drive.", [
      field("folder", "Folder", "Inbox"),
    ]),
    method("google-drive-new-folder", "trigger", "New Drive folder", "Start when a folder is created in Google Drive.", [
      field("folder", "Parent folder", "Clients"),
    ]),
    method("google-drive-upload", "action", "Upload Drive file", "Upload a file to Google Drive.", [
      field("folder", "Folder", "Inbox"),
      field("path", "File path", "/tmp/export.csv"),
    ]),
  ],
})

export const googleDocs = integrationApp({
  id: "google-docs",
  name: "Google Docs",
  description: "Create and edit Google documents.",
  category: "Google",
  iconSlug: "google-docs",
  auth: oauth("google", ["https://www.googleapis.com/auth/documents"]),
  sheetsTemplate: "file",
  pickerGroup: "google",
  methods: [
    method("google-docs-new-document", "trigger", "New Google Doc", "Start when a Google Doc is created.", [
      field("folder", "Folder", "Docs"),
    ]),
    method("google-docs-create", "action", "Create Google Doc", "Create a Google Doc.", [
      field("title", "Title", "Meeting notes"),
      field("content", "Content", "Agenda", { control: "textarea" }),
    ]),
  ],
})
