resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  project  = var.project_id
  location = var.region
  
  enable_shielded_nodes = true

  remove_default_node_pool = true
  initial_node_count       = 1
}


