import type { PageTab } from "@/features/page-tabs/types"

export const memoryTabs = [
  {
    id: "memory-bases",
    label: "Memory bases",
    description: "Shared memory collections that agents can attach to.",
    newAction: {
      label: "New memory base",
      placeholder: "Memory base name",
    },
  },
  {
    id: "knowledge-bases",
    label: "Knowledge bases",
    description: "Uploaded files used for retrieval.",
    newAction: {
      label: "New knowledge base",
      placeholder: "Knowledge base name",
    },
  },
] as const satisfies readonly PageTab[]
