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
  required_version = "~> 1.3.6"
}

provider "google" {
  project = var.project
}
