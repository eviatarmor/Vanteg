import { describe, expect, it } from "vitest"

import {
  failNextCatalogLoad,
  filterTemplates,
  getIndustry,
  getSubTemplate,
  listIndustries,
  listSubTemplates,
  loadCatalog,
} from "./catalog"

describe("industry templates catalog", () => {
  it("ships 5-6 industries each with 3-5 sub-templates", () => {
    const industries = listIndustries()
    expect(industries.length).toBeGreaterThanOrEqual(5)
    expect(industries.length).toBeLessThanOrEqual(6)

    for (const industry of industries) {
      expect(industry.templates.length).toBeGreaterThanOrEqual(3)
      expect(industry.templates.length).toBeLessThanOrEqual(5)
      for (const template of industry.templates) {
        expect(template.industryId).toBe(industry.id)
        expect(template.title.length).toBeGreaterThan(0)
        expect(template.description.length).toBeGreaterThan(0)
        expect(["assistant", "workflow", "team"]).toContain(template.type)
        expect(template.tags.length).toBeGreaterThan(0)
        expect(template.includes.length).toBeGreaterThan(0)
      }
    }
  })

  it("looks up industries and templates by id", () => {
    expect(getIndustry("legal")?.name).toBe("Legal")
    expect(getSubTemplate("legal-quote-assistant")?.type).toBe("assistant")
    expect(listSubTemplates().length).toBeGreaterThan(15)
  })

  it("filters by industry, type, and search query", () => {
    const legalAssistants = filterTemplates({
      industryId: "legal",
      type: "assistant",
    })
    expect(legalAssistants.every((item) => item.industryId === "legal")).toBe(true)
    expect(legalAssistants.every((item) => item.type === "assistant")).toBe(true)

    const quoteHits = filterTemplates({ query: "quote" })
    expect(quoteHits.some((item) => /quote/i.test(item.title))).toBe(true)

    const empty = filterTemplates({ query: "zzzz-no-match" })
    expect(empty).toEqual([])
  })

  it("loads the catalog asynchronously and can surface a failure once", async () => {
    await expect(loadCatalog()).resolves.toEqual(listIndustries())
    failNextCatalogLoad()
    await expect(loadCatalog()).rejects.toThrow(/failed to load/i)
    await expect(loadCatalog()).resolves.toEqual(listIndustries())
  })
})
