import { featuredApps } from "./apps/index.ts"
import { templateOperations } from "./define.ts"
import { longTailApps } from "./long-tail.ts"
import { materializeOAuth } from "./oauth.ts"
import { templates } from "./templates.ts"
import type {
  Connector,
  ConnectorApp,
  ConnectorCategory,
  IntegrationApp,
  Method,
} from "./types.ts"

const PICKER_GROUPS: Record<
  string,
  { name: string; description: string; iconCatalogId: string; iconSlug: string }
> = {
  google: {
    name: "Google",
    description: "Sheets, Drive, and Docs.",
    iconCatalogId: "spreadsheet",
    iconSlug: "google-sheets",
  },
}

function mergeApps(
  featured: IntegrationApp[],
  longTail: IntegrationApp[]
): IntegrationApp[] {
  const seen = new Set<string>()
  const apps: IntegrationApp[] = []
  for (const app of featured) {
    apps.push(app)
    seen.add(app.id)
  }
  for (const app of longTail) {
    if (seen.has(app.id)) {
      continue
    }
    apps.push(app)
    seen.add(app.id)
  }
  return apps
}

function toConnector(app: IntegrationApp): Connector {
  const sheets = templates[app.sheetsTemplate]
  const actionLabels = app.methods
    .filter((method) => method.kind === "action")
    .map((method) => method.label)
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    category: app.category,
    iconSlug: app.iconSlug,
    auth:
      app.auth.kind === "oauth2"
        ? { kind: "oauth2", oauthAppId: app.auth.provider }
        : { kind: app.auth.kind },
    inFields: sheets.in,
    dataFields: sheets.data,
    outFields: sheets.out,
    operations:
      actionLabels.length > 0 ? actionLabels : templateOperations(app),
  }
}

function isShippedApp(app: IntegrationApp): boolean {
  return app.category === "Google"
}

const apps = mergeApps(featuredApps, longTailApps)
const oauth = materializeOAuth(apps)
const allConnectors: Connector[] = apps.map(toConnector)

export function listApps(): IntegrationApp[] {
  return apps
}

export function getApp(id: string): IntegrationApp | undefined {
  return apps.find((app) => app.id === id)
}

export const CONNECTORS: Connector[] = allConnectors.filter(
  (connector) => connector.category === "Google"
)

export function getConnector(id: string): Connector | undefined {
  return allConnectors.find((connector) => connector.id === id)
}

export function listConnectorCategories(): ConnectorCategory[] {
  return [...new Set(CONNECTORS.map((connector) => connector.category))]
}

export function listFeaturedMethods(): Method[] {
  return apps.filter((app) => app.featured).flatMap((app) => [...app.methods])
}

export function listUnshippedFeaturedMethodIds(): string[] {
  return apps
    .filter((app) => app.featured && !isShippedApp(app))
    .flatMap((app) => app.methods.map((method) => method.id))
}

export function listPickerConnectorApps(): ConnectorApp[] {
  const grouped = new Map<string, IntegrationApp[]>()
  for (const app of apps) {
    if (!app.featured || !isShippedApp(app)) {
      continue
    }
    const groupId = app.pickerGroup ?? app.id
    const list = grouped.get(groupId) ?? []
    list.push(app)
    grouped.set(groupId, list)
  }

  return [...grouped.entries()].map(([id, members]) => {
    const meta = PICKER_GROUPS[id]
    const primary = members[0]
    if (!primary) {
      throw new Error(`Picker group ${id} is empty`)
    }
    return {
      id,
      name: meta?.name ?? primary.name,
      description: meta?.description ?? primary.description,
      iconCatalogId: meta?.iconCatalogId ?? primary.id,
      iconSlug: meta?.iconSlug ?? primary.iconSlug,
      methods: members.flatMap((item) => [...item.methods]),
    }
  })
}

export const oauthApps = oauth.oauthApps
export const terraformOAuthApps = oauth.terraformOAuthApps

export function getOAuthApp(id: string) {
  return oauthApps.find((item) => item.id === id)
}
