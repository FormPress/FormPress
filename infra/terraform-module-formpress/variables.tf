variable "project" {
  description = "Project ID at GCP"
}

variable "cluster_name" {
  description = "Cluster Name"
}

variable "control_plane_version" {
  default     = "latest"
  description = "Version of kubernetes control plane"
}

variable "region" {
  description = "Cluster Region"
}

variable "zones" {
  description = "Cluster nodepool zones"
  type        = list(string)
}

variable "gcp_service_list" {
  default = [
    "compute.googleapis.com",
    "container.googleapis.com",
    "sqladmin.googleapis.com"
  ]
  description = "GCP services to enable"
}

variable "deployments" {
  type = map(object({
    image_tag                        = string
    image_repo                       = string
    machine_type                     = string
    min_count                        = number
    max_count                        = number
    initial_node_count               = number
    spot                             = string
    fp_replicas                      = number
    sql_instance_name                = string
    sql_instance_deletion_protection = string
    sql_instance_tier                = string
    database_name                    = string
    hostname                         = string
    bucket_name                      = string
    public_bucket_name               = string
    google_client_id                 = string
    sendgrid_api_key                 = string
    cookie_domain                    = string
    oauth_clients                    = string
    env_var                          = map(string)
  }))

  default = {
    production = {
      "image_tag"                        = "v1.0.0"
      "image_repo"                       = "formpress/main"
      "machine_type"                     = "g1-small",
      "min_count"                        = 1,
      "max_count"                        = 1,
      "initial_node_count"               = 1,
      "spot"                             = "true"
      "fp_replicas"                      = 1,
      "sql_instance_name"                = "production",
      "sql_instance_deletion_protection" = "true",
      "sql_instance_tier"                = "db-n1-standard-1",
      "database_name"                    = "formpress",
      "hostname"                         = "",
      "bucket_name"                      = "file_upload_bucket",
      "public_bucket_name"               = "public_bucket",
      "google_client_id"                 = "",
      "sendgrid_api_key"                 = "",
      "cookie_domain"                    = "mydomain.com",
      "oauth_clients"                    = "",
      "env_var"                          = {}
    }
  }
}
