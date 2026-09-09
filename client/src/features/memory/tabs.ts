import type { PageTab } from "@/features/page-tabs/types"

export const memoryTabs = [
  {
    id: "memory-bases",
    label: "Memory bases",
    description: "Create a memory base so agents can share lasting facts.",
    emptyTitle: "No memory bases yet",
    newAction: {
      label: "New memory base",
      placeholder: "Memory base name",
    },
  },
  {
    id: "knowledge-bases",
    label: "Knowledge bases",
    description: "Create a knowledge base, then upload files for retrieval.",
    emptyTitle: "No knowledge bases yet",
    newAction: {
      label: "New knowledge base",
      placeholder: "Knowledge base name",
    },
  },
] as const satisfies readonly PageTab[]
