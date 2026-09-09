import { describe, expect, it } from "vitest"

import { filterFaq, HELP_DOC_LINKS, HELP_FAQ } from "./faq"

describe("help faq", () => {
  it("ships a focused FAQ set and docs that exist in the repo", () => {
    expect(HELP_FAQ.length).toBeGreaterThanOrEqual(5)
    expect(HELP_FAQ.length).toBeLessThanOrEqual(8)
    expect(HELP_DOC_LINKS.map((doc) => doc.path)).toEqual([
      "README.md",
      "docs/ui-conventions.md",
      "docs/integrations.md",
    ])
  })

  it("filters by question, answer, or tags", () => {
    expect(filterFaq("theme").map((item) => item.id)).toContain("theme")
    expect(filterFaq("").length).toBe(HELP_FAQ.length)
    expect(filterFaq("no-such-topic")).toEqual([])
  })
})
