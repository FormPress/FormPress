variable "project" {
  description = "Project ID at GCP"
}

variable "cluster_name" {
  description = "Cluster Name"
}

variable "region" {
  description = "Cluster Region"
}

variable "zones" {
  description = "Cluster nodepool zones"
  type        = list(string)
}

variable "deployments" {
  type = map(object({
    version                          = string
    machine_type                     = string
    min_count                        = number
    max_count                        = number
    initial_node_count               = number
    sql_instance_name                = string
    sql_instance_deletion_protection = string
    sql_instance_tier                = string
    database_name                    = string
    hostname                         = string
    bucket_name                      = string
    google_client_id                 = string
    sendgrid_api_key                 = string
  }))

  default = {
    production = {
      "version"                          = "856367d"
      "machine_type"                     = "g1-small",
      "min_count"                        = 1,
      "max_count"                        = 1,
      "initial_node_count"               = 1,
      "sql_instance_name"                = "production",
      "sql_instance_deletion_protection" = "true",
      "sql_instance_tier"                = "db-n1-standard-1",
      "database_name"                    = "formpress",
      "hostname"                         = "app.formpress.org",
      "bucket_name"                      = "file_upload_bucket",
      "google_client_id"                 = "",
      "sendgrid_api_key"                 = ""
    }
  }
}
