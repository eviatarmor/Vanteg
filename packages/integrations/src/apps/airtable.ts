import { field, integrationApp, method, oauth } from "../define.ts"
import type { MethodField } from "../types.ts"

function baseField(placeholder = "CRM"): MethodField {
  return field("base", "Base ID", placeholder, {
    help: "Airtable base id or name (resource select later).",
  })
}

function tableField(placeholder = "Leads"): MethodField {
  return field("table", "Table ID", placeholder, {
    help: "Airtable table id or name (resource select later).",
  })
}

function recordFieldsField(
  placeholder = '{\n  "Email": "ada@acme.com"\n}'
): MethodField {
  return field("fields", "Fields", placeholder, {
    control: "code",
    language: "json",
    help: "Record field values as a JSON object.",
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
    ]),
    method("airtable-record-updated", "trigger", "Record updated", "Start when an Airtable record changes.", [
      baseField(),
      tableField(),
    ]),
    method("airtable-record-deleted", "trigger", "Record deleted", "Start when an Airtable record is deleted.", [
      baseField(),
      tableField(),
    ]),
    method("airtable", "action", "Create record", "Create or update an Airtable record.", [
      baseField(),
      tableField(),
      recordFieldsField(),
    ]),
    method("airtable-update-record", "action", "Update record", "Update an Airtable record.", [
      baseField(),
      tableField(),
      field("recordId", "Record ID", "rec123"),
      recordFieldsField(),
    ]),
    method("airtable-find-records", "action", "Find records", "Search Airtable records.", [
      baseField(),
      tableField(),
      formulaField(),
    ]),
    method("airtable-delete-record", "action", "Delete record", "Delete an Airtable record.", [
      baseField(),
      tableField(),
      field("recordId", "Record ID", "rec123"),
    ]),
  ],
})
