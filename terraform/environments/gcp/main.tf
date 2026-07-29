# ══════════════════════════════════════════════════════════════════
#  CAPA DE ABAJO (específica de Google Cloud). Patrón heredado de
#  Polaris_Google_Cloude — mismo criterio, proyecto GCP separado.
#  Su ÚNICO trabajo: entregar una VM Linux con IP pública y Docker
#  para correr Redis + worker sports-sync (BullMQ). El API vive en
#  Vercel, NO en esta VM — por eso no hay firewall web (80/443) acá.
# ══════════════════════════════════════════════════════════════════

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# ── Red dedicada (no usamos la 'default': aislar es buena práctica) ──
resource "google_compute_network" "vpc" {
  name                    = "pronostico-vpc"
  auto_create_subnetworks = true
}

# ── Firewall: SSH restringido a tus IPs (ver variable ssh_source_ranges) ──
resource "google_compute_firewall" "ssh" {
  name    = "pronostico-allow-ssh"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  source_ranges = var.ssh_source_ranges
  target_tags   = ["pronostico"]
}

# ── IP pública FIJA (para que SSH no cambie al reiniciar la VM) ──
resource "google_compute_address" "static_ip" {
  name = "pronostico-ip"
}

# ── La VM ──
resource "google_compute_instance" "vm" {
  name         = "pronostico-server"
  machine_type = var.machine_type
  tags         = ["pronostico"]

  # Adjuntar la service account de abajo a una VM YA CORRIENDO requiere que
  # la API de GCP la detenga y reinicie — Terraform lo hace solo con esta
  # bandera. Sin ella, el apply falla (no se puede cambiar service_account
  # en caliente).
  allow_stopping_for_update = true

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 20
    }
  }

  network_interface {
    network = google_compute_network.vpc.name
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  metadata = {
    # Llave SSH del usuario 'deploy' (no root)
    ssh-keys = "${var.ssh_user}:${file(var.ssh_public_key_path)}"
    # El cloud-init COMPARTIDO instala Docker.
    user-data = file("${path.module}/../../cloud-init.yaml")
  }

  # Service account dedicada, sin scopes amplios — hoy no necesita ningún
  # permiso de GCP extra (Redis/worker corren local a la VM). Si más
  # adelante sports-sync necesita escribir a un bucket o Secret Manager,
  # se le agregan roles acá (mismo patrón que polaris-vm en Polaris).
  service_account {
    email  = google_service_account.vm_sa.email
    scopes = ["cloud-platform"]
  }
}

# ── Service account dedicada de la VM (no la default del proyecto) —
# permite otorgar solo lo que necesite, cuando lo necesite. ──
resource "google_service_account" "vm_sa" {
  account_id   = "pronostico-vm"
  display_name = "APP Pronóstico VM — service account del worker"
}
