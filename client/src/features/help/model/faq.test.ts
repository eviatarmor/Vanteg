import { describe, expect, it } from "vitest"

import { filterFaq, HELP_DOC_LINKS, HELP_FAQ } from "./faq"

describe("help faq", () => {
  it("ships FAQ covering product, billing, and compliance", () => {
    expect(HELP_FAQ.length).toBeGreaterThanOrEqual(10)
    expect(HELP_FAQ.length).toBeLessThanOrEqual(16)
    expect(HELP_FAQ.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "export-data",
        "delete-account",
        "dpa",
        "billing-plan",
      ])
    )
    expect(HELP_DOC_LINKS.map((doc) => doc.path)).toEqual([
      "README.md",
      "docs/ui-conventions.md",
      "docs/integrations.md",
    ])
  })

  it("filters by question, answer, or tags including compliance", () => {
    expect(filterFaq("theme").map((item) => item.id)).toContain("theme")
    expect(filterFaq("gdpr").map((item) => item.id)).toEqual(
      expect.arrayContaining(["export-data", "delete-account"])
    )
    expect(filterFaq("billing").map((item) => item.id)).toContain("billing-plan")
    expect(filterFaq("").length).toBe(HELP_FAQ.length)
    expect(filterFaq("no-such-topic")).toEqual([])
  })
})
