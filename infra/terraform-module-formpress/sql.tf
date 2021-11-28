resource "google_sql_database_instance" "instance" {
  for_each = var.deployments

  project             = var.project
  name                = each.value.sql_instance_name
  database_version    = "MYSQL_5_7"
  region              = var.region
  deletion_protection = each.value.sql_instance_deletion_protection

  settings {
    tier = each.value.sql_instance_tier
  }
}

resource "google_sql_database" "database" {
  for_each = var.deployments
  project  = var.project
  name     = each.value.database_name
  instance = resource.google_sql_database_instance.instance[each.key].name

}

resource "random_password" "sql_password" {
  for_each = var.deployments
  length   = 64
  special  = false
}

resource "google_sql_user" "user" {
  for_each = var.deployments
  project  = var.project
  name     = "formpress"
  instance = resource.google_sql_database_instance.instance[each.key].name
  password = random_password.sql_password[each.key].result
}
