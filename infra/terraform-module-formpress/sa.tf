module "service_accounts" {
  for_each      = var.deployments
  source        = "terraform-google-modules/service-accounts/google"
  version       = "~> 3.0"
  project_id    = var.project
  prefix        = "sa-${each.key}"
  names         = ["ServiceAccount", each.key]
  generate_keys = true
  project_roles = [
    "${var.project}=>roles/cloudsql.client",
    "${var.project}=>roles/storage.objectViewer",
  ]
}

resource "kubernetes_secret" "sa_credentials" {
  for_each = var.deployments
  metadata {
    name = "sa-credentials-${each.key}"
  }

  data = {
    "credentials.json" = base64encode(module.service_accounts[each.key].key)
  }
}
