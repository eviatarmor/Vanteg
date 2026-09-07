data "azuread_application_published_app_ids" "well_known" {
  count = var.manage_microsoft ? 1 : 0
}

resource "azuread_service_principal" "msgraph" {
  count        = var.manage_microsoft ? 1 : 0
  client_id    = data.azuread_application_published_app_ids.well_known[0].result["MicrosoftGraph"]
  use_existing = true
}

resource "azuread_application" "freeze" {
  count            = var.manage_microsoft ? 1 : 0
  display_name     = "Freeze"
  sign_in_audience = "AzureADMultipleOrgs"

  web {
    redirect_uris = [local.oauth_redirect_uris["microsoft"]]
  }

  required_resource_access {
    resource_app_id = data.azuread_application_published_app_ids.well_known[0].result["MicrosoftGraph"]

    dynamic "resource_access" {
      for_each = toset(local.oauth_apps["microsoft"].scopes)
      content {
        id   = azuread_service_principal.msgraph[0].oauth2_permission_scope_ids[resource_access.value]
        type = "Scope"
      }
    }
  }
}

resource "azuread_application_password" "freeze" {
  count          = var.manage_microsoft ? 1 : 0
  application_id = azuread_application.freeze[0].id
  display_name   = "freeze-terraform"
}

resource "azuread_service_principal" "freeze" {
  count     = var.manage_microsoft ? 1 : 0
  client_id = azuread_application.freeze[0].client_id
}
