import type { DatabaseCellVariant, TextFormat } from "./types"

export type ColumnTypeOption = {
  id: string
  label: string
  variant: DatabaseCellVariant
  textFormat?: TextFormat
  regex?: string
  children?: ColumnTypeOption[]
}

export const TEXT_FORMAT_REGEX: Record<TextFormat, string> = {
  plain: "",
  email: String.raw`^[^\s@]+@[^\s@]+\.[^\s@]+$`,
  url: String.raw`^https?:\/\/[^\s/$.?#].[^\s]*$`,
  phone: String.raw`^[+]?[\d\s().-]{7,}$`,
  uuid: String.raw`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`,
}

export const databaseColumnTypeTree: ColumnTypeOption[] = [
  {
    id: "text",
    label: "Text",
    variant: "short-text",
    children: [
      {
        id: "plain",
        label: "Plain",
        variant: "short-text",
        textFormat: "plain",
        regex: TEXT_FORMAT_REGEX.plain,
      },
      {
        id: "email",
        label: "Email",
        variant: "short-text",
        textFormat: "email",
        regex: TEXT_FORMAT_REGEX.email,
      },
      {
        id: "url",
        label: "URL",
        variant: "url",
        textFormat: "url",
        regex: TEXT_FORMAT_REGEX.url,
      },
      {
        id: "phone",
        label: "Phone",
        variant: "short-text",
        textFormat: "phone",
        regex: TEXT_FORMAT_REGEX.phone,
      },
      {
        id: "uuid",
        label: "UUID",
        variant: "short-text",
        textFormat: "uuid",
        regex: TEXT_FORMAT_REGEX.uuid,
      },
    ],
  },
  { id: "long-text", label: "Long text", variant: "long-text" },
  { id: "number", label: "Number", variant: "number" },
  { id: "select", label: "Select", variant: "select" },
  { id: "checkbox", label: "Checkbox", variant: "checkbox" },
  { id: "date", label: "Date", variant: "date" },
  { id: "time", label: "Time", variant: "time" },
  { id: "datetime", label: "Datetime", variant: "datetime" },
  { id: "secret", label: "Secret", variant: "secret" },
]

function flattenColumnTypes(nodes: ColumnTypeOption[]): ColumnTypeOption[] {
  return nodes.flatMap((node) =>
    node.children?.length ? flattenColumnTypes(node.children) : [node]
  )
}

export const databaseColumnTypes: {
  value: string
  label: string
  variant: DatabaseCellVariant
}[] = flattenColumnTypes(databaseColumnTypeTree).map((type) => ({
  value: type.id,
  label: type.label,
  variant: type.variant,
}))

export function findColumnTypeId(column: {
  variant: DatabaseCellVariant
  textFormat?: TextFormat
}): string {
  const leaves = flattenColumnTypes(databaseColumnTypeTree)
  if (column.textFormat) {
    const formatted = leaves.find((type) => type.textFormat === column.textFormat)
    if (formatted) {
      return formatted.id
    }
  }
  const exact = leaves.find((type) => type.variant === column.variant && !type.textFormat)
  if (exact) {
    return exact.id
  }
  return leaves.find((type) => type.variant === column.variant)?.id ?? "plain"
}

export function findColumnType(id: string): ColumnTypeOption | undefined {
  const search = (nodes: ColumnTypeOption[]): ColumnTypeOption | undefined => {
    for (const node of nodes) {
      if (node.id === id) {
        return node
      }
      if (node.children) {
        const nested = search(node.children)
        if (nested) {
          return nested
        }
      }
    }
    return undefined
  }
  return search(databaseColumnTypeTree)
}

export function isTextColumnVariant(variant: DatabaseCellVariant): boolean {
  return variant === "short-text" || variant === "url"
}

export function isTimeColumnVariant(variant: DatabaseCellVariant): boolean {
  return variant === "time" || variant === "datetime"
}

export function valueMatchesRegex(value: string, regex?: string): boolean {
  const pattern = regex?.trim()
  if (!pattern || !value) {
    return true
  }
  try {
    return new RegExp(pattern).test(value)
  } catch {
    return true
  }
}
