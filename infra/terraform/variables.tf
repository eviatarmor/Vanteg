variable "environment" {
  type        = string
  description = "Environment name used in SSM paths (dev, prod)."
  default     = "dev"
}

variable "public_base_url" {
  type        = string
  description = "Public origin of the Freeze app, used as the OAuth redirect base."
  default     = "https://app.freeze.dev"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
}

variable "google_project" {
  type        = string
  description = "GCP project that Freeze uses for Google APIs."
  default     = ""
}

variable "google_region" {
  type        = string
  default     = "us-central1"
}

variable "manage_microsoft" {
  type        = bool
  description = "Create the Freeze Microsoft Entra (Azure AD) application and store its credentials in SSM."
  default     = true
}

variable "manage_google_apis" {
  type        = bool
  description = "Enable Google APIs needed by Freeze-owned Google OAuth scopes."
  default     = true
}

variable "oauth_client_ids" {
  type        = map(string)
  description = "Optional client IDs for providers Terraform cannot create. Microsoft is created automatically when manage_microsoft is true."
  default     = {}
  sensitive   = true
}

variable "oauth_client_secrets" {
  type        = map(string)
  description = "Optional client secrets for providers Terraform cannot create. Microsoft is created automatically when manage_microsoft is true."
  default     = {}
  sensitive   = true
}
