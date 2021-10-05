terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "3.85.0"
    }
  }
}

provider "google" {
  project = var.project_id
}
