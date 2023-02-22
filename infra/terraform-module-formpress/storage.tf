resource "google_storage_bucket" "file-uploads" {
  for_each = var.deployments

  name          = each.value.bucket_name
  location      = "EU"
  force_destroy = true

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_member" "member" {
  for_each = var.deployments
  bucket   = google_storage_bucket.file-uploads[each.key].name
  role     = "roles/storage.admin"
  member   = module.service_accounts[each.key].iam_email
}

resource "google_storage_bucket" "public-uploads" {
  for_each = var.deployments

  name          = each.value.public_bucket_name
  location      = "EU"
  force_destroy = true

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_member" "member-admin-public-bucket" {
  for_each = var.deployments
  bucket   = google_storage_bucket.public-uploads[each.key].name
  role     = "roles/storage.admin"
  member   = module.service_accounts[each.key].iam_email
}

resource "google_storage_bucket_iam_member" "member-public-bucket" {
  for_each = var.deployments
  bucket   = google_storage_bucket.public-uploads[each.key].name
  role     = "roles/storage.objectViewer"
  member   = "allUsers"
}