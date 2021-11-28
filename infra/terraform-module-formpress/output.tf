output "LB_IP" {
  value = {
    for environment, value in var.deployments : "${environment}" => resource.kubernetes_service.formpress_service[environment].status[0].load_balancer[0].ingress[0].ip
  }
}
