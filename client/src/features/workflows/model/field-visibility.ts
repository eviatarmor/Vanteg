import type { FieldShowWhen } from "@workspace/integrations"

import type { NodeField } from "./types"

function matchesClause(clause: FieldShowWhen, config: Record<string, string>): boolean {
  const value = config[clause.key] ?? ""
  if (clause.truthy !== undefined) {
    const truthy = value !== "" && value !== "false"
    return clause.truthy ? truthy : !truthy
  }
  if (clause.equals !== undefined) {
    const allowed = Array.isArray(clause.equals) ? clause.equals : [clause.equals]
    return allowed.includes(value)
  }
  if (clause.notEquals !== undefined) {
    const denied = Array.isArray(clause.notEquals) ? clause.notEquals : [clause.notEquals]
    return !denied.includes(value)
  }
  return true
}

export function isFieldVisible(field: NodeField, config: Record<string, string>): boolean {
  if (!field.showWhen) {
    return true
  }
  const clauses = Array.isArray(field.showWhen) ? field.showWhen : [field.showWhen]
  return clauses.every((clause) => matchesClause(clause, config))
}

export function visibleFields(
  fields: readonly NodeField[],
  config: Record<string, string>
): NodeField[] {
  return fields.filter((field) => isFieldVisible(field, config))
}
