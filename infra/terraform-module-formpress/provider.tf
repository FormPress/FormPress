terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.10"
    }
    google = {
      source  = "hashicorp/google"
      version = "5.20.0"
    }
  }
  required_version = "1.7.4"
}

provider "google" {
  project = var.project
}
