# Vanteg-owned integration apps

This folder holds the OAuth clients Vanteg operates so workspace users can click **Connect** instead of pasting a client ID and secret.

## How it works

1. `oauth-apps.ts` is the catalog of Vanteg-owned OAuth apps (Google, Microsoft, Slack, GitHub, and the rest).
2. Terraform in `infra/terraform/` wires the rest:
   - Redirect URIs from `public_base_url` + each app's `redirect_path`
   - AWS SSM parameters for every `FREEZE_*_OAUTH_CLIENT_ID` / `_SECRET`
   - An IAM policy so the Vanteg runtime can read those parameters
   - The Microsoft Entra (Azure AD) application, including Graph scopes and a client secret
   - Google APIs required by the Google OAuth scopes
3. Client IDs and secrets never ship in the browser. The Integrations page uses `/integrations/oauth/<app>/callback`.
4. API-key, JWT, and database connectors still collect credentials in the UI.

## Apply

```bash
cd infra/terraform
terraform init
terraform apply \
  -var='public_base_url=https://app.example.com' \
  -var='google_project=your-gcp-project'
```

Microsoft credentials are created by Terraform and stored in SSM. For other providers, Terraform still creates the SSM parameters; set the values once with:

```bash
aws ssm put-parameter --name /vanteg/dev/oauth/slack/client_id --type SecureString --value "$SLACK_CLIENT_ID" --overwrite
aws ssm put-parameter --name /vanteg/dev/oauth/slack/client_secret --type SecureString --value "$SLACK_CLIENT_SECRET" --overwrite
```

`lifecycle.ignore_changes` on the parameter values keeps later applies from clobbering those secrets.

After changing `oauth-apps.ts`, regenerate the Terraform locals:

```bash
cd client && npx vite-node ../infra/integrations/export-terraform.ts
```

The unit tests fail if the catalog and `oauth_apps.auto.tf.json` drift.

## Adding a managed OAuth app

1. Add a row to `oauth-apps.ts` and point connectors at that `oauthAppId`.
2. Run `npx vite-node ../infra/integrations/export-terraform.ts` from `client/`.
3. `terraform apply` to create SSM paths (and Microsoft/Google resources when those flags are on).
