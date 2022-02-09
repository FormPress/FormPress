resource "random_password" "jwt_secret" {
  for_each = var.deployments
  length   = 256
  special  = false
}

resource "kubernetes_deployment" "sql_proxy" {
  for_each = var.deployments

  metadata {
    name = "cloud-sql-proxy-${each.key}"
    labels = {
      app = "cloud-sql-proxy-${each.key}"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "cloud-sql-proxy-${each.key}"
      }
    }

    template {
      metadata {
        labels = {
          app = "cloud-sql-proxy-${each.key}"
        }
      }

      spec {
        container {
          image = "gcr.io/cloudsql-docker/gce-proxy:1.16"
          name  = "cloudsqlproxy"
          command = [
            "/cloud_sql_proxy",
            "-instances=${resource.google_sql_database_instance.instance[each.key].connection_name}=tcp:0.0.0.0:3306",
            "-credential_file=/secrets/cloudsql/credentials.json"
          ]
          resources {
            limits = {
              cpu = "50m"
            }
          }

          volume_mount {
            mount_path = "/secrets/cloudsql"
            name       = "cloudsql-instance-credentials"
            read_only  = true
          }
        }

        node_selector = {
          "cloud.google.com/gke-nodepool" = each.key
        }

        volume {
          name = "cloudsql-instance-credentials"
          secret {
            default_mode = "0420"
            secret_name  = "sa-credentials-${each.key}"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "cloudsqlproxy_service" {
  for_each = var.deployments

  metadata {
    name = "cloudsqlproxy-${each.key}"
  }
  spec {
    selector = {
      app = "cloud-sql-proxy-${each.key}"
    }
    session_affinity = "ClientIP"
    port {
      port        = 3306
      target_port = 3306
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "formpress" {
  for_each = var.deployments

  metadata {
    name = "formpress-${each.key}"
    labels = {
      app = "formpress-${each.key}"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "formpress-${each.key}"
      }
    }

    template {
      metadata {
        labels = {
          app = "formpress-${each.key}"
        }
      }

      spec {
        container {
          image = "gcr.io/formpress/formpress:${each.value.version}"
          name  = "formpress"

          env {
            name  = "FP_HOST"
            value = "https://${each.value.hostname}"
          }

          env {
            name  = "FILE_UPLOAD_BUCKET"
            value = each.value.bucket_name
          }

          env {
            name  = "GOOGLE_CREDENTIALS_CLIENT_ID"
            value = each.value.google_client_id
          }

          env {
            name = "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS"
            value_from {
              secret_key_ref {
                name = "sa-credentials-${each.key}"
                key  = "credentialsbase64"
              }
            }
          }

          env {
            name  = "JWT_SECRET"
            value = random_password.jwt_secret[each.key].result
          }

          env {
            name  = "MYSQL_DATABASE"
            value = "formpress"
          }

          env {
            name  = "MYSQL_HOST"
            value = "cloudsqlproxy-${each.key}.default.svc.cluster.local"
          }

          env {
            name  = "MYSQL_USER"
            value = "formpress"
          }

          env {
            name  = "MYSQL_PASSWORD"
            value = random_password.sql_password[each.key].result
          }

          env {
            name  = "SENDGRID_API_KEY"
            value = each.value.sendgrid_api_key
          }

          dynamic "env" {
            for_each = each.value.env_var

            content {
              name  = env.key
              value = env.value
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "100Mi"
            }
            limits = {
              cpu    = 1
              memory = "1024Mi"
            }
          }
        }

        node_selector = {
          "cloud.google.com/gke-nodepool" = each.key
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      spec.0.template.0.spec.0.container.0.image
    ]
  }
}

resource "kubernetes_service" "formpress_service" {
  for_each = var.deployments

  metadata {
    name = "formpress-${each.key}"
  }
  spec {
    selector = {
      app = "formpress-${each.key}"
    }
    session_affinity = "None"
    port {
      port        = 80
      target_port = 3001
    }

    type = "LoadBalancer"
  }
}
