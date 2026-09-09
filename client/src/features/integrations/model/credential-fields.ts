import { getOAuthApp } from "@workspace/integrations"

import type { Connector, CredentialField } from "./types"

export function isManagedOAuth(connector: Connector): boolean {
  if (connector.auth.kind !== "oauth2" || !connector.auth.oauthAppId) {
    return false
  }
  return getOAuthApp(connector.auth.oauthAppId)?.managed === true
}

export function connectActionLabel(connector: Connector): string {
  if (isManagedOAuth(connector) && connector.auth.oauthAppId) {
    const app = getOAuthApp(connector.auth.oauthAppId)
    return `Connect with ${app?.name ?? connector.name}`
  }
  return "Connect"
}

export function credentialFieldsFor(connector: Connector): CredentialField[] {
  if (connector.auth.kind === "oauth2") {
    if (isManagedOAuth(connector)) {
      return []
    }
    return [
      { id: "clientId", label: "Client ID" },
      { id: "clientSecret", label: "Client Secret", secret: true },
    ]
  }

  if (connector.auth.kind === "api-key") {
    return [{ id: "apiKey", label: "API Key", secret: true, placeholder: "Paste API key" }]
  }

  if (connector.auth.kind === "jwt") {
    return [
      { id: "algorithm", label: "Algorithm", placeholder: "RS256" },
      { id: "secret", label: "Secret / private key", secret: true },
      { id: "issuer", label: "Issuer" },
      { id: "audience", label: "Audience" },
    ]
  }

  if (connector.auth.kind === "basic") {
    if (connector.category === "Databases") {
      return [
        { id: "host", label: "Host", placeholder: "db.example.com" },
        { id: "database", label: "Database" },
        { id: "username", label: "Username" },
        { id: "password", label: "Password", secret: true },
      ]
    }
    return [
      { id: "username", label: "Username" },
      { id: "password", label: "Password", secret: true },
    ]
  }

  if (connector.auth.kind === "bearer") {
    return [{ id: "token", label: "Token", secret: true }]
  }

  return [{ id: "jsonKey", label: "Service account JSON", secret: true }]
}
