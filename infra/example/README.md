# Hosting Formpress

Currently Formpress terraform only supports GCP. Default settings will create new kubernetes cluster and sql instance.

## Important notes

- In our testing cluster creating did not wait google services, reapplying with terraform fixed issue.
- Default user role does not have any permissions, you will need to give permissions from admin panel which can be accessed with `/admin`

## To use terraform remote backend

If you want to use remote backend, uncomment `backend.tf`
You need to create backend bucket before using it in `backend.tf`

```
bucket = "my-state-bucket"
```

Change "my-state-bucket" to your backend bucket

## Required values

- GCP Project Name as `project`
- Cluster name as `cluster_name`
- Url address as `host_url`
- Email for default admin account as `admin_email`
- Password for default admin account as `admin_password`

## Modifing other variabes

You can change addition values from `main.tf`. Such as kubernetes node specs, or sql instace machine specs, or Formpress version from `image_tag`.

## Configure DNS

Terraform output shows IP address of the load balancer. Use this IP for your DNS records.
