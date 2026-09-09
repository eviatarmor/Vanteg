import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { getOAuthApp, oauthApps, terraformOAuthApps } from "@workspace/integrations"

const terraformDir = path.resolve(process.cwd(), "../infra/terraform")

describe("Vanteg-owned OAuth apps", () => {
  it("registers a managed Google app so users never paste a client secret", () => {
    const google = getOAuthApp("google")
    expect(google?.managed).toBe(true)
    expect(google?.clientIdEnv).toBe("FREEZE_GOOGLE_OAUTH_CLIENT_ID")
    expect(google?.clientSecretEnv).toBe("FREEZE_GOOGLE_OAUTH_CLIENT_SECRET")
    expect(google?.authorizeUrl).toContain("accounts.google.com")
    expect(google?.tokenUrl).toContain("oauth2.googleapis.com")
    expect(google?.redirectPath).toBe("/integrations/oauth/google/callback")
  })

  it("covers Slack, GitHub, Microsoft, and other managed providers", () => {
    expect(oauthApps.map((app) => app.id)).toEqual(
      expect.arrayContaining([
        "google",
        "microsoft",
        "slack",
        "github",
        "notion",
        "klaviyo",
        "pandadoc",
        "acuity",
      ])
    )
    expect(oauthApps.every((app) => app.managed)).toBe(true)
  })

  it("exports terraform locals for every managed oauth app", () => {
    const locals = terraformOAuthApps()
    expect(Object.keys(locals).sort()).toEqual(oauthApps.map((app) => app.id).sort())
    expect(locals.google).toEqual({
      name: "Google",
      client_id_env: "FREEZE_GOOGLE_OAUTH_CLIENT_ID",
      client_secret_env: "FREEZE_GOOGLE_OAUTH_CLIENT_SECRET",
      authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
      token_url: "https://oauth2.googleapis.com/token",
      redirect_path: "/integrations/oauth/google/callback",
      scopes: expect.arrayContaining(["https://www.googleapis.com/auth/spreadsheets"]),
    })
  })

  it("keeps terraform oauth_apps.auto.tf.json in sync with the catalog", () => {
    const file = readFileSync(path.join(terraformDir, "oauth_apps.auto.tf.json"), "utf8")
    expect(JSON.parse(file)).toEqual({ locals: { oauth_apps: terraformOAuthApps() } })
  })

  it("provisions SSM parameters and redirect URIs for every oauth app", () => {
    const tf = readFileSync(path.join(terraformDir, "oauth.tf"), "utf8")
    expect(tf).toContain('resource "aws_ssm_parameter" "oauth_client_id"')
    expect(tf).toContain('resource "aws_ssm_parameter" "oauth_client_secret"')
    expect(tf).toContain("for_each = local.oauth_apps")
    expect(tf).toContain("var.public_base_url")
    expect(tf).toContain("redirect_path")
  })

  it("creates the Microsoft Entra application in terraform", () => {
    const tf = readFileSync(path.join(terraformDir, "microsoft.tf"), "utf8")
    expect(tf).toContain("azuread_application")
    expect(tf).toContain("oauth2_permission_scope_ids")
    expect(tf).toContain('local.oauth_apps["microsoft"]')
  })
})

