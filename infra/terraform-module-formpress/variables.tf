variable "project_id" {
  description = "Project ID at GCP"
}

variable "cluster_name" {
  description = "Cluster Name"
}

variable "region" {
  description = "Cluster Region"
}

variable "deployments" {
  type = map(object({
    machine_type = string
  }))

  default = {
    production = {
      "machine_type" = "g1-small"
    }
  }
}
