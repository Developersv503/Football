# ── Salidas: lo que Terraform te muestra tras crear la infra ──

output "server_ip" {
  description = "IP pública de la VM (para SSH y para configurar el API de Vercel apuntando a este Redis)"
  value       = google_compute_address.static_ip.address
}

output "ssh_command" {
  description = "Comando listo para conectarte por SSH"
  value       = "ssh ${var.ssh_user}@${google_compute_address.static_ip.address}"
}
