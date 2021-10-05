variable "project_id" {
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
    machine_type       = string,
    min_count          = number,
    max_count          = number,
    initial_node_count = number
  }))

  default = {
    production = {
      "machine_type"       = "g1-small",
      "min_count"          = 1,
      "max_count"          = 1,
      "initial_node_count" = 1,
    }
  }
}
