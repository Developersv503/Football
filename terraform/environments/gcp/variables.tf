# ── Entradas de la receta. Rellenas sus valores en terraform.tfvars ──

variable "project_id" {
  description = "ID del proyecto de Google Cloud (separado de Polaris — negocio independiente)"
  type        = string
}

variable "region" {
  description = "Región de Google Cloud"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona dentro de la región"
  type        = string
  default     = "us-central1-a"
}

variable "machine_type" {
  description = "Tamaño de la VM. e2-small = 2 vCPU / 2GB — corre Redis + worker BullMQ sin ahogarse"
  type        = string
  default     = "e2-small"
}

variable "ssh_user" {
  description = "Usuario SSH que se crea en la VM. NO es root (buena práctica)"
  type        = string
  default     = "deploy"
}

variable "ssh_public_key_path" {
  description = "Ruta a tu llave PÚBLICA SSH (ej: ~/.ssh/id_ed25519.pub)"
  type        = string
}

variable "ssh_source_ranges" {
  description = "Desde qué IPs se permite SSH. Sin CI/CD todavía → restringí a TU IP (ej: [\"190.10.20.30/32\"]). Solo abrir a 0.0.0.0/0 el día que un runner de GitHub Actions con IP dinámica necesite conectarse (igual que Polaris)."
  type        = list(string)
}
