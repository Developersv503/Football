# Fija las versiones de Terraform y del proveedor. Buena práctica:
# que el proyecto se comporte igual hoy y dentro de un año.
terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}
