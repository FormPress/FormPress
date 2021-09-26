data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${module.gke.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke.ca_certificate)
}

module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 3.3.0"

  project_id   = var.project_id
  network_name = "formpress-default"
  routing_mode = "GLOBAL"

  subnets = [
    {
      subnet_name   = "formpress-subnet"
      subnet_ip     = "10.28.0.0/16"
      subnet_region = var.region
    },
  ]

  secondary_ranges = {
    formpress-subnet = [
      {
        range_name    = "formpress-subnet-pods"
        ip_cidr_range = "10.38.0.0/16"
      },
      {
        range_name    = "formpress-subnet-services"
        ip_cidr_range = "10.68.0.0/16"
      },
    ]
  }
}

module "gke" {
  source                     = "terraform-google-modules/kubernetes-engine/google"
  project_id                 = var.project_id
  name                       = var.cluster_name
  region                     = var.region
  http_load_balancing        = true
  horizontal_pod_autoscaling = true
  network_policy             = false
  network                    = "formpress-default"
  subnetwork                 = "formpress-subnet"
  ip_range_services          = "formpress-subnet-pods"
  ip_range_pods              = "formpress-subnet-services"
  node_pools = [for key in keys(var.deployments) :
    {
      name               = key
      machine_type       = var.deployments[key].machine_type
      min_count          = 1
      max_count          = 5
      local_ssd_count    = 0
      disk_size_gb       = 100
      disk_type          = "pd-standard"
      image_type         = "COS"
      auto_repair        = true
      auto_upgrade       = true
      preemptible        = false
      initial_node_count = 1
    }
  ]

  depends_on = [module.vpc]
}
