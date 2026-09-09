import type { PageTab } from "@/features/page-tabs/types"

export const apiKeyTabs = [
  {
    id: "private-keys",
    label: "Private keys",
    description: "Secret keys for calling Vanteg from outside this workspace.",
    emptyTitle: "No private keys yet",
    newAction: {
      label: "New private key",
      placeholder: "Key name",
    },
  },
  {
    id: "public-keys",
    label: "Public keys",
    description: "Public keys for verifying requests from this workspace.",
    emptyTitle: "No public keys yet",
    newAction: {
      label: "New public key",
      placeholder: "Key name",
    },
  },
] as const satisfies readonly PageTab[]
