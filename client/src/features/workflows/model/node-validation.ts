import { isSecretSetupKey, type FieldValidationRule } from "@workspace/integrations"

import { isUnaryOperator, parseConditionGroup } from "./conditions"
import { missingExpressionRefs } from "./expression"
import { isFieldVisible } from "./field-visibility"
import { isValidCron } from "./schedule"
import { parseRoutes, uniqueRouteNames } from "./structured-fields"
import type { NodeField, VantegNode, Workflow, WorkflowNodeType } from "./types"

export interface FieldError {
  key: string
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https?:\/\/\S+$/i

function looksLikeExpression(value: string): boolean {
  return value.includes("{{") && value.includes("}}")
}

function parseNumber(value: string): number | null {
  if (!value.trim()) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function isValidRegex(value: string): boolean {
  try {
    new RegExp(value)
    return true
  } catch {
    return false
  }
}

function ruleMessage(rule: FieldValidationRule, fallback: string): string {
  return rule.message || fallback
}

function validateRule(
  field: NodeField,
  rule: FieldValidationRule,
  value: string,
  config: Record<string, string>,
  node: VantegNode,
  workflow: Workflow | undefined,
  availableRefs: Iterable<string>
): string | null {
  switch (rule.kind) {
    case "required":
      return value.trim() ? null : ruleMessage(rule, `${field.label} is required.`)
    case "integer": {
      if (!value.trim() || looksLikeExpression(value)) {
        return null
      }
      return /^-?\d+$/.test(value.trim())
        ? null
        : ruleMessage(rule, `${field.label} must be an integer.`)
    }
    case "min": {
      const parsed = parseNumber(value)
      if (parsed === null || rule.value === undefined) {
        return null
      }
      return parsed >= rule.value
        ? null
        : ruleMessage(rule, `${field.label} must be at least ${rule.value}.`)
    }
    case "max": {
      const parsed = parseNumber(value)
      if (parsed === null || rule.value === undefined) {
        return null
      }
      return parsed <= rule.value
        ? null
        : ruleMessage(rule, `${field.label} must be at most ${rule.value}.`)
    }
    case "url":
      if (!value.trim() || looksLikeExpression(value)) {
        return null
      }
      return URL_RE.test(value.trim())
        ? null
        : ruleMessage(rule, `${field.label} must be a URL.`)
    case "email":
      if (!value.trim() || looksLikeExpression(value)) {
        return null
      }
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .every((item) => EMAIL_RE.test(item) || looksLikeExpression(item))
        ? null
        : ruleMessage(rule, `${field.label} must be a valid email.`)
    case "json":
      if (!value.trim() || looksLikeExpression(value)) {
        return null
      }
      return isValidJson(value) ? null : ruleMessage(rule, `${field.label} must be valid JSON.`)
    case "cron":
      if (!value.trim()) {
        return null
      }
      return isValidCron(value) ? null : ruleMessage(rule, `${field.label} must be a valid cron expression.`)
    case "regex":
      if (!value.trim() || looksLikeExpression(value)) {
        return null
      }
      if (rule.pattern) {
        return new RegExp(rule.pattern).test(value)
          ? null
          : ruleMessage(rule, `${field.label} has an invalid format.`)
      }
      return isValidRegex(value) ? null : ruleMessage(rule, `${field.label} must be a valid regular expression.`)
    case "dateOrder": {
      const beforeKey = rule.beforeKey ?? "start"
      const afterKey = rule.afterKey ?? "until"
      const before = config[beforeKey]
      const after = config[afterKey]
      if (!before || !after) {
        return null
      }
      const start = Date.parse(before)
      const end = Date.parse(after)
      if (Number.isNaN(start) || Number.isNaN(end)) {
        return null
      }
      return end >= start
        ? null
        : ruleMessage(rule, `${field.label} must be after ${beforeKey}.`)
    }
    case "uniqueWebhookPath": {
      if (!workflow) {
        return null
      }
      const path = value.trim()
      if (!path) {
        return null
      }
      const duplicate = workflow.nodes.some(
        (item) =>
          item.id !== node.id &&
          item.data.catalogId === "webhook" &&
          (item.data.config.path || "").trim() === path
      )
      return duplicate ? ruleMessage(rule, "Webhook path must be unique in this workflow.") : null
    }
    case "uniqueRouteName": {
      const routes = parseRoutes(value)
      return uniqueRouteNames(routes)
        ? null
        : ruleMessage(rule, "Route names must be unique.")
    }
    case "expressionRef": {
      const missing = missingExpressionRefs(value, availableRefs)
      return missing.length
        ? ruleMessage(rule, `Unknown reference: ${missing[0]}`)
        : null
    }
    case "credential":
      return value.trim() ? null : ruleMessage(rule, "Select a credential.")
    case "resource":
      return value.trim() ? null : ruleMessage(rule, `${field.label} is required.`)
    case "destructive":
      return null
    default:
      return null
  }
}

function conditionErrors(field: NodeField, value: string): FieldError[] {
  const group = parseConditionGroup(value)
  const errors: FieldError[] = []
  group.rules.forEach((rule, index) => {
    if (!rule.left.trim()) {
      errors.push({
        key: field.key,
        message: `Condition ${index + 1} needs a Value 1.`,
      })
    }
    if (!isUnaryOperator(rule.operator) && !rule.right.trim() && rule.operator !== "exists") {
      if (
        rule.operator !== "empty" &&
        rule.operator !== "not_empty" &&
        rule.operator !== "not_exists"
      ) {
        errors.push({
          key: field.key,
          message: `Condition ${index + 1} needs a Value 2.`,
        })
      }
    }
  })
  return errors
}

export function availableExpressionPaths(
  nodeId: string,
  workflow: Workflow | undefined
): string[] {
  if (!workflow) {
    return []
  }
  const incoming = workflow.edges.filter((edge) => edge.target === nodeId)
  const paths: string[] = []
  for (const edge of incoming) {
    const source = workflow.nodes.find((item) => item.id === edge.source)
    if (!source) {
      continue
    }
    const label = source.data.label
    for (const item of source.data.outVars) {
      if (item.key && !isSecretSetupKey(item.key)) {
        paths.push(`${label}.${item.key}`)
      }
    }
  }
  return paths
}

export function validateNodeSetup(
  node: VantegNode,
  catalog: WorkflowNodeType | undefined,
  workflow?: Workflow
): FieldError[] {
  if (!catalog) {
    return []
  }
  const errors: FieldError[] = []
  const available = availableExpressionPaths(node.id, workflow)
  for (const field of catalog.fields) {
    if (!isFieldVisible(field, node.data.config)) {
      continue
    }
    const value = node.data.config[field.key] ?? ""
    const rules: FieldValidationRule[] = [
      ...(field.required ? [{ kind: "required" as const }] : []),
      ...(field.validation ?? []),
    ]
    if (field.control === "conditions") {
      errors.push(...conditionErrors(field, value))
    }
    for (const rule of rules) {
      const message = validateRule(field, rule, value, node.data.config, node, workflow, available)
      if (message) {
        errors.push({ key: field.key, message })
      }
    }
    if (field.mode !== "fixed" && looksLikeExpression(value)) {
      const missing = missingExpressionRefs(value, available)
      if (missing.length) {
        errors.push({
          key: field.key,
          message: `Unknown reference: ${missing[0]}`,
        })
      }
    }
  }
  return uniqueErrors(errors)
}

function uniqueErrors(errors: FieldError[]): FieldError[] {
  const seen = new Set<string>()
  const result: FieldError[] = []
  for (const error of errors) {
    const id = `${error.key}:${error.message}`
    if (seen.has(id)) {
      continue
    }
    seen.add(id)
    result.push(error)
  }
  return result
}

export function validateWorkflow(workflow: Workflow, getCatalog: (id: string) => WorkflowNodeType | undefined): FieldError[] {
  return workflow.nodes.flatMap((node) =>
    validateNodeSetup(node, getCatalog(node.data.catalogId), workflow).map((error) => ({
      ...error,
      message: `${node.data.label}: ${error.message}`,
    }))
  )
}
