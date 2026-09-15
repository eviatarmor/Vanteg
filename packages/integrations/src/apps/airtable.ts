import { airtableRecordListOutputs, airtableRecordOutputs } from "../contracts.ts"
import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function baseField(placeholder = "CRM"): MethodField {
  return field("base", "Base", placeholder, {
    control: "resource",
    resourceType: "airtable.base",
    section: "connection",
    help: "Pick an Airtable base, or enter a custom base id.",
  })
}

function tableField(placeholder = "Leads"): MethodField {
  return field("table", "Table", placeholder, {
    control: "resource",
    resourceType: "airtable.table",
    help: "Pick an Airtable table, or enter a custom table id.",
  })
}

function recordFieldsField(
  placeholder = '{\n  "Email": "ada@acme.com"\n}'
): MethodField {
  return field("fields", "Fields", placeholder, {
    control: "mapping",
    mode: "either",
    help: "Map incoming values onto Airtable fields. JSON objects from saved workflows still load.",
  })
}

function formulaField(placeholder = "{Email} = 'ada@acme.com'"): MethodField {
  return field("formula", "Formula", placeholder, {
    control: "textarea",
    help: "Airtable filter-by-formula expression.",
  })
}

export const airtable = integrationApp({
  id: "airtable",
  name: "Airtable",
  description: "Create Airtable records.",
  category: "Storage",
  iconSlug: "airtable",
  auth: oauth("airtable", ["data.records:read", "data.records:write"]),
  sheetsTemplate: "sheet",
  methods: [
    method("airtable-new-record", "trigger", "New record", "Start when an Airtable record is created.", [
      baseField(),
      tableField(),
    ], { outputs: airtableRecordOutputs }),
    method("airtable-record-updated", "trigger", "Record updated", "Start when an Airtable record changes.", [
      baseField(),
      tableField(),
    ], { outputs: airtableRecordOutputs }),
    method("airtable-record-deleted", "trigger", "Record deleted", "Start when an Airtable record is deleted.", [
      baseField(),
      tableField(),
    ], { outputs: airtableRecordOutputs }),
    method("airtable", "action", "Create record", "Create or update an Airtable record.", [
      baseField(),
      tableField(),
      recordFieldsField(),
    ], { outputs: airtableRecordOutputs }),
    method("airtable-update-record", "action", "Update record", "Update an Airtable record.", [
      baseField(),
      tableField(),
      field("recordId", "Record ID", "rec123", { required: true, mode: "either" }),
      recordFieldsField(),
    ], { outputs: airtableRecordOutputs }),
    method("airtable-find-records", "action", "Find records", "Search Airtable records.", [
      baseField(),
      tableField(),
      formulaField(),
    ], { outputs: airtableRecordListOutputs }),
    method("airtable-delete-record", "action", "Delete record", "Delete an Airtable record.", [
      baseField(),
      tableField(),
      field("recordId", "Record ID", "rec123", {
        required: true,
        mode: "either",
        validation: [{ kind: "destructive" }],
      }),
    ], { outputs: airtableRecordOutputs }),
  ],
})
