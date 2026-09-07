import type { DatabaseCellVariant } from "./types"

export const databaseColumnTypes: {
  value: DatabaseCellVariant
  label: string
}[] = [
  { value: "short-text", label: "Text" },
  { value: "long-text", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
  { value: "secret", label: "Secret" },
]
