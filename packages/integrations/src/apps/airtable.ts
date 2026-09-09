import { field, integrationApp, method, oauth } from "../define.ts"

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
      field("base", "Base", "CRM"),
    ]),
    method("airtable-record-updated", "trigger", "Record updated", "Start when an Airtable record changes.", [
      field("base", "Base", "CRM"),
      field("table", "Table", "Leads"),
    ]),
    method("airtable-record-deleted", "trigger", "Record deleted", "Start when an Airtable record is deleted.", [
      field("base", "Base", "CRM"),
      field("table", "Table", "Leads"),
    ]),
    method("airtable", "action", "Create record", "Create or update an Airtable record.", [
      field("base", "Base", "CRM"),
    ]),
    method("airtable-update-record", "action", "Update record", "Update an Airtable record.", [
      field("base", "Base", "CRM"),
      field("recordId", "Record ID", "rec123"),
    ]),
    method("airtable-find-records", "action", "Find records", "Search Airtable records.", [
      field("base", "Base", "CRM"),
      field("formula", "Formula", "{Email} = 'ada@acme.com'"),
    ]),
    method("airtable-delete-record", "action", "Delete record", "Delete an Airtable record.", [
      field("base", "Base", "CRM"),
      field("recordId", "Record ID", "rec123"),
    ]),
  ],
})
