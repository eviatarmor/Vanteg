locals {
  google_services = toset([
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
  ])
}

resource "google_project_service" "oauth_apis" {
  for_each = var.manage_google_apis && var.google_project != "" ? local.google_services : toset([])

  project            = var.google_project
  service            = each.value
  disable_on_destroy = false
}
