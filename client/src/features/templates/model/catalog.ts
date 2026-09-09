import type { Industry, IndustryId, SubTemplate, TemplateType } from "./types"

// Placeholder — replaced by full catalog in next commit.
const industries: Industry[] = []

export function listIndustries(): Industry[] {
  return industries
}

export function getIndustry(id: IndustryId): Industry | undefined {
  return industries.find((industry) => industry.id === id)
}

export function listSubTemplates(): SubTemplate[] {
  return industries.flatMap((industry) => industry.templates)
}

export function getSubTemplate(id: string): SubTemplate | undefined {
  return listSubTemplates().find((template) => template.id === id)
}

export function filterTemplates(options: {
  industryId?: IndustryId | "all"
  type?: TemplateType | "all"
  query?: string
}): SubTemplate[] {
  return listSubTemplates()
}

let failNextLoad = false

export function failNextCatalogLoad(): void {
  failNextLoad = true
}

export async function loadCatalog(): Promise<Industry[]> {
  return new Promise((resolve, reject) => {
    queueMicrotask(() => {
      if (failNextLoad) {
        failNextLoad = false
        reject(new Error("Failed to load industry templates"))
        return
      }
      resolve(listIndustries())
    })
  })
}
