import { field, integrationApp, method, oauth } from "../define.ts"

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
      field("sheet", "Sheet", "Leads"),
    ]),
    method("spreadsheet-updated-row", "trigger", "Updated row", "Start when a spreadsheet row changes.", [
      field("sheet", "Sheet", "Leads"),
    ]),
    method("spreadsheet", "action", "Update row", "Create or update a spreadsheet row.", [
      field("sheet", "Sheet", "Leads"),
    ]),
    method("spreadsheet-create-row", "action", "Create row", "Append a spreadsheet row.", [
      field("sheet", "Sheet", "Leads"),
      field("values", "Values", "Ada, ada@acme.com", { control: "textarea" }),
    ]),
    method("spreadsheet-delete-row", "action", "Delete row", "Delete a spreadsheet row.", [
      field("sheet", "Sheet", "Leads"),
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
