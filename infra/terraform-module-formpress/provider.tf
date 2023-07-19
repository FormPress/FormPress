terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.10"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.36"
    }
  }
  required_version = "~> 1.5.3"
}

provider "google" {
  project = var.project
}
