terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = ">= 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "azuread" {}

provider "google" {
  project = var.google_project
  region  = var.google_region
}
