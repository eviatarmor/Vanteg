locals {
  oauth_redirect_uris = {
    for id, app in local.oauth_apps :
    id => "${trimsuffix(var.public_base_url, "/")}${app.redirect_path}"
  }

  microsoft_client_id     = try(azuread_application.vanteg[0].client_id, lookup(var.oauth_client_ids, "microsoft", "PENDING"))
  microsoft_client_secret = try(azuread_application_password.vanteg[0].value, lookup(var.oauth_client_secrets, "microsoft", "PENDING"))

  oauth_client_id_values = {
    for id, app in local.oauth_apps :
    id => id == "microsoft" ? local.microsoft_client_id : lookup(var.oauth_client_ids, id, "PENDING")
  }

  oauth_client_secret_values = {
    for id, app in local.oauth_apps :
    id => id == "microsoft" ? local.microsoft_client_secret : lookup(var.oauth_client_secrets, id, "PENDING")
  }
}

resource "aws_ssm_parameter" "oauth_client_id" {
  for_each = local.oauth_apps

  name        = "/vanteg/${var.environment}/oauth/${each.key}/client_id"
  description = each.value.client_id_env
  type        = "SecureString"
  value       = local.oauth_client_id_values[each.key]

  tags = {
    App      = "vanteg"
    OAuthApp = each.key
    EnvVar   = each.value.client_id_env
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "oauth_client_secret" {
  for_each = local.oauth_apps

  name        = "/vanteg/${var.environment}/oauth/${each.key}/client_secret"
  description = each.value.client_secret_env
  type        = "SecureString"
  value       = local.oauth_client_secret_values[each.key]

  tags = {
    App      = "vanteg"
    OAuthApp = each.key
    EnvVar   = each.value.client_secret_env
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_iam_policy" "oauth_secrets" {
  name        = "vanteg-${var.environment}-oauth-secrets"
  description = "Read Vanteg-owned OAuth client credentials from SSM."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/vanteg/${var.environment}/oauth/*"
      }
    ]
  })
}
