import catalogDataA from "./catalog-data-a.json"
import catalogDataB from "./catalog-data-b.json"

import type { Industry, IndustryId, SubTemplate, TemplateType } from "./types"

const industries = [...catalogDataA, ...catalogDataB] as Industry[]

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
  const industryId = options.industryId ?? "all"
  const type = options.type ?? "all"
  const query = options.query?.trim().toLowerCase() ?? ""

  return listSubTemplates().filter((template) => {
    if (industryId !== "all" && template.industryId !== industryId) {
      return false
    }
    if (type !== "all" && template.type !== type) {
      return false
    }
    if (!query) {
      return true
    }
    const haystack = [
      template.title,
      template.description,
      template.longDescription,
      ...template.tags,
      getIndustry(template.industryId)?.name ?? "",
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(query)
  })
}

let failNextLoad = false

/** Test helper: force the next loadCatalog() to reject once. */
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
