variable "admin_email" {
  description = "Default admin account email with @ symbol"
}

variable "admin_password" {
  description = "Default admin account password"
}

variable "cluster_name" {
  description = "Cluster Name"
}

variable "host_url" {
  description = "Without protocol, ex: subdomain.domain.com"
}

variable "project" {
  description = "Project ID at GCP"
}

variable "region" {
  default     = "europe-west1"
  description = "Cluster Region"
}

variable "upload_bucket" {
  default  = ""
  description = "Bucket name for file uploads"
}

variable "zones" {
  default     = ["europe-west1-b"]
  description = "For multizone setup use [ europe-west1-b, europe-west1-c ] add quotation marks"
}