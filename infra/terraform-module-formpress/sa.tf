module "service_accounts" {
  for_each      = var.deployments
  source        = "terraform-google-modules/service-accounts/google"
  version       = "~> 3.0"
  project_id    = var.project
  prefix        = "sa-${each.key}"
  names         = ["ServiceAccount"]
  generate_keys = true
  project_roles = [
    "${var.project}=>roles/cloudsql.client",
    "${var.project}=>roles/storage.objectViewer",
    "${var.project}=>roles/errorreporting.writer",
  ]
}

resource "kubernetes_secret" "sa_credentials" {
  for_each = var.deployments
  metadata {
    name = "sa-credentials-${each.key}"
  }

  data = {
    "credentials.json"  = module.service_accounts[each.key].key,
    "credentialsbase64" = base64encode(module.service_accounts[each.key].key)
  }
}
