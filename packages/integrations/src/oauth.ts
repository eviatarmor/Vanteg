import type { IntegrationApp, OAuthApp, OAuthProviderDef, OAuthProvisioner, TerraformOAuthApp } from "./types.ts"

function app(id: string, name: string, authorizeUrl: string, tokenUrl: string, scopes: string[]) {
  return { id, name, authorizeUrl, tokenUrl, scopes }
}

const providerDefs = [
  app(
    "google",
    "Google",
    "https://accounts.google.com/o/oauth2/v2/auth",
    "https://oauth2.googleapis.com/token",
    [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/contacts",
      "https://www.googleapis.com/auth/chat.messages",
      "https://www.googleapis.com/auth/tasks",
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/adwords",
      "https://www.googleapis.com/auth/bigquery",
      "https://www.googleapis.com/auth/devstorage.read_write",
      "https://www.googleapis.com/auth/forms.body",
    ]
  ),
  app(
    "microsoft",
    "Microsoft",
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    [
      "Mail.ReadWrite",
      "Calendars.ReadWrite",
      "Files.ReadWrite.All",
      "Sites.ReadWrite.All",
      "Chat.ReadWrite",
      "Tasks.ReadWrite",
      "User.Read",
    ]
  ),
  app(
    "slack",
    "Slack",
    "https://slack.com/oauth/v2/authorize",
    "https://slack.com/api/oauth.v2.access",
    [
      "channels:read",
      "channels:manage",
      "groups:write",
      "chat:write",
      "reactions:write",
      "users:read",
    ]
  ),
  app(
    "github",
    "GitHub",
    "https://github.com/login/oauth/authorize",
    "https://github.com/login/oauth/access_token",
    ["repo", "read:org", "workflow"]
  ),
  app(
    "gitlab",
    "GitLab",
    "https://gitlab.com/oauth/authorize",
    "https://gitlab.com/oauth/token",
    ["api", "read_user"]
  ),
  app(
    "bitbucket",
    "Bitbucket",
    "https://bitbucket.org/site/oauth2/authorize",
    "https://bitbucket.org/site/oauth2/access_token",
    ["repository", "pullrequest", "issue"]
  ),
  app(
    "notion",
    "Notion",
    "https://api.notion.com/v1/oauth/authorize",
    "https://api.notion.com/v1/oauth/token",
    []
  ),
  app(
    "hubspot",
    "HubSpot",
    "https://app.hubspot.com/oauth/authorize",
    "https://api.hubapi.com/oauth/v1/token",
    [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.companies.write",
      "crm.objects.deals.read",
      "crm.objects.deals.write",
    ]
  ),
  app(
    "salesforce",
    "Salesforce",
    "https://login.salesforce.com/services/oauth2/authorize",
    "https://login.salesforce.com/services/oauth2/token",
    ["api", "refresh_token"]
  ),
  app(
    "zoom",
    "Zoom",
    "https://zoom.us/oauth/authorize",
    "https://zoom.us/oauth/token",
    ["meeting:write", "user:read"]
  ),
  app(
    "dropbox",
    "Dropbox",
    "https://www.dropbox.com/oauth2/authorize",
    "https://api.dropboxapi.com/oauth2/token",
    ["files.content.write", "files.content.read"]
  ),
  app(
    "linkedin",
    "LinkedIn",
    "https://www.linkedin.com/oauth/v2/authorization",
    "https://www.linkedin.com/oauth/v2/accessToken",
    ["w_member_social", "r_liteprofile"]
  ),
  app(
    "x",
    "X",
    "https://twitter.com/i/oauth2/authorize",
    "https://api.twitter.com/2/oauth2/token",
    ["tweet.read", "tweet.write", "users.read"]
  ),
  app(
    "facebook",
    "Facebook",
    "https://www.facebook.com/v21.0/dialog/oauth",
    "https://graph.facebook.com/v21.0/oauth/access_token",
    ["pages_manage_posts", "instagram_basic", "ads_management"]
  ),
  app(
    "shopify",
    "Shopify",
    "https://{shop}.myshopify.com/admin/oauth/authorize",
    "https://{shop}.myshopify.com/admin/oauth/access_token",
    ["write_products", "write_orders", "read_customers"]
  ),
  app(
    "atlassian",
    "Atlassian",
    "https://auth.atlassian.com/authorize",
    "https://auth.atlassian.com/oauth/token",
    ["read:jira-work", "write:jira-work", "read:confluence-content.all"]
  ),
  app(
    "asana",
    "Asana",
    "https://app.asana.com/-/oauth_authorize",
    "https://app.asana.com/-/oauth_token",
    ["default"]
  ),
  app(
    "clickup",
    "ClickUp",
    "https://app.clickup.com/api",
    "https://api.clickup.com/api/v2/oauth/token",
    []
  ),
  app(
    "monday",
    "Monday.com",
    "https://auth.monday.com/oauth2/authorize",
    "https://auth.monday.com/oauth2/token",
    ["boards:write", "updates:write"]
  ),
  app(
    "linear",
    "Linear",
    "https://linear.app/oauth/authorize",
    "https://api.linear.app/oauth/token",
    ["read", "write"]
  ),
  app(
    "intercom",
    "Intercom",
    "https://app.intercom.com/oauth",
    "https://api.intercom.io/auth/eagle/token",
    []
  ),
  app(
    "zendesk",
    "Zendesk",
    "https://{subdomain}.zendesk.com/oauth/authorizations/new",
    "https://{subdomain}.zendesk.com/oauth/tokens",
    ["tickets:write", "users:write", "read"]
  ),
  app(
    "mailchimp",
    "Mailchimp",
    "https://login.mailchimp.com/oauth2/authorize",
    "https://login.mailchimp.com/oauth2/token",
    []
  ),
  app(
    "paypal",
    "PayPal",
    "https://www.paypal.com/signin/authorize",
    "https://api-m.paypal.com/v1/oauth2/token",
    ["https://uri.paypal.com/services/payments/payment"]
  ),
  app(
    "square",
    "Square",
    "https://connect.squareup.com/oauth2/authorize",
    "https://connect.squareup.com/oauth2/token",
    ["PAYMENTS_WRITE", "ORDERS_WRITE"]
  ),
  app(
    "box",
    "Box",
    "https://account.box.com/api/oauth2/authorize",
    "https://api.box.com/oauth2/token",
    ["root_readwrite"]
  ),
  app(
    "figma",
    "Figma",
    "https://www.figma.com/oauth",
    "https://www.figma.com/api/oauth/token",
    ["file_read"]
  ),
  app(
    "canva",
    "Canva",
    "https://www.canva.com/api/oauth/authorize",
    "https://api.canva.com/rest/v1/oauth/token",
    ["design:content:write"]
  ),
  app(
    "miro",
    "Miro",
    "https://miro.com/oauth/authorize",
    "https://api.miro.com/v1/oauth/token",
    ["boards:write"]
  ),
  app(
    "webflow",
    "Webflow",
    "https://webflow.com/oauth/authorize",
    "https://api.webflow.com/oauth/access_token",
    ["cms:write", "sites:read"]
  ),
  app(
    "spotify",
    "Spotify",
    "https://accounts.spotify.com/authorize",
    "https://accounts.spotify.com/api/token",
    ["playlist-modify-public", "user-read-email"]
  ),
  app(
    "docusign",
    "DocuSign",
    "https://account.docusign.com/oauth/auth",
    "https://account.docusign.com/oauth/token",
    ["signature", "impersonation"]
  ),
  app(
    "calendly",
    "Calendly",
    "https://auth.calendly.com/oauth/authorize",
    "https://auth.calendly.com/oauth/token",
    ["default"]
  ),
  app(
    "typeform",
    "Typeform",
    "https://api.typeform.com/oauth/authorize",
    "https://api.typeform.com/oauth/token",
    ["forms:write", "responses:read"]
  ),
  app(
    "quickbooks",
    "QuickBooks",
    "https://appcenter.intuit.com/connect/oauth2",
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    ["com.intuit.quickbooks.accounting"]
  ),
  app(
    "xero",
    "Xero",
    "https://login.xero.com/identity/connect/authorize",
    "https://identity.xero.com/connect/token",
    ["accounting.transactions", "accounting.contacts"]
  ),
  app(
    "gusto",
    "Gusto",
    "https://api.gusto.com/oauth/authorize",
    "https://api.gusto.com/oauth/token",
    ["employees:read", "payrolls:write"]
  ),
  app(
    "rippling",
    "Rippling",
    "https://app.rippling.com/api/o/authorize",
    "https://app.rippling.com/api/o/token",
    []
  ),
  app(
    "okta",
    "Okta",
    "https://{domain}/oauth2/v1/authorize",
    "https://{domain}/oauth2/v1/token",
    ["okta.users.manage"]
  ),
  app(
    "auth0",
    "Auth0",
    "https://{domain}/authorize",
    "https://{domain}/oauth/token",
    ["create:users", "read:users"]
  ),
  app(
    "discord",
    "Discord",
    "https://discord.com/oauth2/authorize",
    "https://discord.com/api/oauth2/token",
    ["bot", "identify", "guilds"]
  ),
  app(
    "airtable",
    "Airtable",
    "https://airtable.com/oauth2/v1/authorize",
    "https://airtable.com/oauth2/v1/token",
    ["data.records:read", "data.records:write"]
  ),
  app(
    "trello",
    "Trello",
    "https://trello.com/1/authorize",
    "https://trello.com/1/OAuthGetAccessToken",
    ["read", "write"]
  ),
  app(
    "pipedrive",
    "Pipedrive",
    "https://oauth.pipedrive.com/oauth/authorize",
    "https://oauth.pipedrive.com/oauth/token",
    ["deals:full", "contacts:full"]
  ),
  app(
    "reddit",
    "Reddit",
    "https://www.reddit.com/api/v1/authorize",
    "https://www.reddit.com/api/v1/access_token",
    ["identity", "submit", "read"]
  ),
  app(
    "pinterest",
    "Pinterest",
    "https://www.pinterest.com/oauth/",
    "https://api.pinterest.com/v5/oauth/token",
    ["boards:read", "pins:write"]
  ),
  app(
    "tiktok",
    "TikTok",
    "https://www.tiktok.com/v2/auth/authorize/",
    "https://open.tiktokapis.com/v2/oauth/token/",
    ["user.info.basic", "video.upload"]
  ),
  app(
    "buffer",
    "Buffer",
    "https://bufferapp.com/oauth2/authorize",
    "https://api.bufferapp.com/1/oauth2/token.json",
    []
  ),
  app(
    "netlify",
    "Netlify",
    "https://app.netlify.com/authorize",
    "https://api.netlify.com/oauth/token",
    []
  ),
  app(
    "surveymonkey",
    "SurveyMonkey",
    "https://api.surveymonkey.com/oauth/authorize",
    "https://api.surveymonkey.com/oauth/token",
    []
  ),
  app(
    "ebay",
    "eBay",
    "https://auth.ebay.com/oauth2/authorize",
    "https://api.ebay.com/identity/v1/oauth2/token",
    ["sell.inventory", "sell.fulfillment"]
  ),
  app(
    "zoho",
    "Zoho",
    "https://accounts.zoho.com/oauth/v2/auth",
    "https://accounts.zoho.com/oauth/v2/token",
    ["ZohoCRM.modules.ALL"]
  ),
  app(
    "front",
    "Front",
    "https://app.frontapp.com/oauth/authorize",
    "https://app.frontapp.com/oauth/token",
    []
  ),
  app(
    "helpscout",
    "Help Scout",
    "https://secure.helpscout.net/authentication/authorizeClientApplication",
    "https://api.helpscout.net/v2/oauth2/token",
    []
  ),
  app(
    "klaviyo",
    "Klaviyo",
    "https://www.klaviyo.com/oauth/authorize",
    "https://a.klaviyo.com/oauth/token",
    ["lists:read", "profiles:write", "events:write", "campaigns:write"]
  ),
  app(
    "pandadoc",
    "PandaDoc",
    "https://app.pandadoc.com/oauth2/authorize",
    "https://api.pandadoc.com/oauth2/access_token",
    ["read+write"]
  ),
  app(
    "acuity",
    "Acuity Scheduling",
    "https://acuityscheduling.com/oauth2/authorize",
    "https://acuityscheduling.com/oauth2/token",
    ["api-v1"]
  ),
]

const GOOGLE_SERVICES = [
  "sheets.googleapis.com",
  "gmail.googleapis.com",
  "drive.googleapis.com",
  "calendar-json.googleapis.com",
  "docs.googleapis.com",
  "people.googleapis.com",
  "chat.googleapis.com",
  "tasks.googleapis.com",
  "analyticsdata.googleapis.com",
  "youtube.googleapis.com",
  "googleads.googleapis.com",
  "bigquery.googleapis.com",
  "storage.googleapis.com",
  "forms.googleapis.com",
] as const

function provisionerFor(id: string): OAuthProvisioner {
  if (id === "microsoft") {
    return "azuread"
  }
  if (id === "google") {
    return "google-apis"
  }
  return "ssm-slot"
}

function envName(id: string): string {
  return id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
}

export const OAUTH_PROVIDERS: OAuthProviderDef[] = providerDefs.map((item) => ({
  id: item.id,
  name: item.name,
  authorizeUrl: item.authorizeUrl,
  tokenUrl: item.tokenUrl,
  provisioner: provisionerFor(item.id),
  baseScopes: item.scopes,
  googleServices: item.id === "google" ? GOOGLE_SERVICES : undefined,
}))

export function materializeOAuth(apps: readonly IntegrationApp[]): {
  oauthApps: OAuthApp[]
  terraformOAuthApps: () => Record<string, TerraformOAuthApp>
} {
  const extra = new Map<string, string[]>()
  for (const app of apps) {
    if (app.auth.kind !== "oauth2") {
      continue
    }
    const current = extra.get(app.auth.provider) ?? []
    extra.set(app.auth.provider, [...current, ...(app.auth.scopes ?? [])])
  }

  const oauthApps: OAuthApp[] = OAUTH_PROVIDERS.map((provider) => {
    const merged = [...new Set([...provider.baseScopes, ...(extra.get(provider.id) ?? [])])]
    const env = envName(provider.id)
    return {
      id: provider.id,
      name: provider.name,
      managed: true,
      clientIdEnv: `FREEZE_${env}_OAUTH_CLIENT_ID`,
      clientSecretEnv: `FREEZE_${env}_OAUTH_CLIENT_SECRET`,
      authorizeUrl: provider.authorizeUrl,
      tokenUrl: provider.tokenUrl,
      redirectPath: `/integrations/oauth/${provider.id}/callback`,
      scopes: merged,
      provisioner: provider.provisioner,
    }
  })

  return {
    oauthApps,
    terraformOAuthApps() {
      return Object.fromEntries(
        oauthApps.map((item) => [
          item.id,
          {
            name: item.name,
            client_id_env: item.clientIdEnv,
            client_secret_env: item.clientSecretEnv,
            authorize_url: item.authorizeUrl,
            token_url: item.tokenUrl,
            redirect_path: item.redirectPath,
            scopes: item.scopes,
          },
        ])
      )
    },
  }
}
