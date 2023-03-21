module "formpress" {
  source = "../terraform-module-formpress"

  project = var.project
  region  = var.region
  zones   = var.zones
  //use below for multi zone setup
  // zones = ["europe-west1-a", "europe-west1-b", "europe-west1-c"]
  cluster_name = var.cluster_name

  deployments = {
    prod = {
      "image_tag"                        = "v1.0.0",
      "image_repo"                       = "formpress/main"
      "machine_type"                     = "g1-small",
      "min_count"                        = 1,
      "max_count"                        = 1,
      "initial_node_count"               = 1,
      "spot"                             = "false"
      "fp_replicas"                      = 1,
      "sql_instance_name"                = "formpress",
      "sql_instance_deletion_protection" = "true",
      "sql_instance_tier"                = "db-f1-micro"
      "database_name"                    = "formpress"
      "hostname"                         = var.host_url,
      "bucket_name"                      = var.upload_bucket,
      "google_client_id"                 = "",
      "sendgrid_api_key"                 = "",
      "env_var" = {
        "NODE_ENV"    = "production"
        "FE_BACKEND"  = "https://${var.host_url}"
        "FE_FRONTEND" = "https://${var.host_url}"

        "ADMINEMAIL"    = var.admin_email
        "ADMINPASSWORD" = var.admin_password
      }
    }
  }
}

output "LB_IP" {
  value = module.formpress.LB_IP
}
