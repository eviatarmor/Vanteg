import { airtable } from "./airtable.ts"
import { discord } from "./discord.ts"
import { familyApps } from "./families.ts"
import { github } from "./github.ts"
import { googleDocs, googleDrive, googleSheets } from "./google.ts"
import { notion } from "./notion.ts"
import { slack } from "./slack.ts"
import type { IntegrationApp } from "../types.ts"

export const featuredApps: IntegrationApp[] = [
  slack,
  github,
  googleSheets,
  googleDrive,
  googleDocs,
  notion,
  airtable,
  discord,
  ...familyApps,
]
