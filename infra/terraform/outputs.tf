output "oauth_redirect_uris" {
  description = "Redirect URIs to register on each provider. Microsoft is set automatically."
  value       = local.oauth_redirect_uris
}

output "oauth_ssm_paths" {
  description = "SSM parameter paths for Vanteg-owned OAuth client credentials."
  value = {
    for id, app in local.oauth_apps :
    id => {
      client_id_env     = app.client_id_env
      client_secret_env = app.client_secret_env
      client_id         = aws_ssm_parameter.oauth_client_id[id].name
      client_secret     = aws_ssm_parameter.oauth_client_secret[id].name
    }
  }
}

output "oauth_secrets_policy_arn" {
  description = "IAM policy that lets the Vanteg runtime read OAuth secrets."
  value       = aws_iam_policy.oauth_secrets.arn
}

output "microsoft_client_id" {
  description = "Client ID of the Vanteg Microsoft Entra application, when managed."
  value       = var.manage_microsoft ? azuread_application.vanteg[0].client_id : null
}
