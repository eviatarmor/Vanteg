export type TemplateType = "assistant" | "workflow" | "team"

export type IndustryId =
  | "legal"
  | "real-estate"
  | "ecommerce"
  | "saas"
  | "agencies"
  | "healthcare"

export interface SubTemplate {
  id: string
  industryId: IndustryId
  title: string
  description: string
  longDescription: string
  type: TemplateType
  tags: string[]
  includes: string[]
  /** Seed prompt / instructions for assistants */
  instructions?: string
  /** Minimal workflow node catalog ids for workflow stubs */
  workflowNodeIds?: string[]
}

export interface Industry {
  id: IndustryId
  name: string
  description: string
  templates: SubTemplate[]
}

export type TemplateTypeFilter = "all" | TemplateType
