import { driveFileOutputs, sheetRowOutputs } from "../contracts.ts"
import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function spreadsheetField(placeholder = "Leads"): MethodField {
  return field("spreadsheetId", "Spreadsheet", placeholder, {
    control: "resource",
    resourceType: "sheets.spreadsheet",
    section: "connection",
    help: "Pick a spreadsheet from the connected Google account, or enter a custom spreadsheet id.",
  })
}

function sheetField(placeholder = "Leads"): MethodField {
  return field("sheet", "Sheet", placeholder, {
    control: "resource",
    resourceType: "sheets.sheet",
    section: "parameters",
    help: "Pick a spreadsheet sheet from the connected Google account, or enter a custom sheet name.",
  })
}

function folderField(placeholder = "Inbox"): MethodField {
  return field("folder", "Folder", placeholder, {
    control: "resource",
    resourceType: "drive.folder",
    help: "Pick a Drive folder, or enter a custom folder id.",
  })
}

function valuesField(placeholder = "Ada, ada@acme.com"): MethodField {
  return field("values", "Column mapping", placeholder, {
    control: "mapping",
    mode: "either",
    help: "Map incoming fields onto spreadsheet columns. Legacy comma-separated values still load.",
  })
}

function contentField(placeholder: string): MethodField {
  return field("content", "Content", placeholder, { control: "textarea" })
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
      spreadsheetField(),
      sheetField(),
    ], { outputs: sheetRowOutputs }),
    method("spreadsheet-updated-row", "trigger", "Updated row", "Start when a spreadsheet row changes.", [
      spreadsheetField(),
      sheetField(),
    ], { outputs: sheetRowOutputs }),
    method("spreadsheet", "action", "Update row", "Create or update a spreadsheet row.", [
      spreadsheetField(),
      sheetField(),
      field("row", "Row", "12", { mode: "either", valueType: "integer" }),
      valuesField(),
    ], { outputs: sheetRowOutputs }),
    method("spreadsheet-create-row", "action", "Create row", "Append a spreadsheet row.", [
      spreadsheetField(),
      sheetField(),
      valuesField(),
    ], { outputs: sheetRowOutputs }),
    method("spreadsheet-delete-row", "action", "Delete row", "Delete a spreadsheet row.", [
      spreadsheetField(),
      sheetField(),
      field("row", "Row", "12", {
        mode: "either",
        valueType: "integer",
        validation: [{ kind: "destructive" }],
      }),
    ], { outputs: sheetRowOutputs }),
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
      folderField(),
    ], { outputs: driveFileOutputs }),
    method("google-drive-new-folder", "trigger", "New Drive folder", "Start when a folder is created in Google Drive.", [
      field("folder", "Parent folder", "Clients", {
        control: "resource",
        resourceType: "drive.folder",
        help: "Pick a parent Drive folder, or enter a custom folder id.",
      }),
    ], { outputs: driveFileOutputs }),
    method("google-drive-upload", "action", "Upload Drive file", "Upload a file to Google Drive.", [
      folderField(),
      field("path", "File path", "/tmp/export.csv", { mode: "either" }),
      field("content", "Binary / content", "", {
        control: "textarea",
        mode: "either",
        help: "Optional file contents. Leave blank to upload from File path.",
      }),
    ], { outputs: driveFileOutputs }),
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
      folderField("Docs"),
    ], { outputs: driveFileOutputs }),
    method("google-docs-create", "action", "Create Google Doc", "Create a Google Doc.", [
      field("title", "Title", "Meeting notes", { mode: "either" }),
      contentField("Agenda"),
    ], { outputs: driveFileOutputs }),
  ],
})
