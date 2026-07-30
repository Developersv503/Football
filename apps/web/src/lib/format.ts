const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Programado',
  LIVE: 'En vivo',
  FINISHED: 'Finalizado',
  POSTPONED: 'Postergado',
  CANCELLED: 'Cancelado',
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

// Hora en UTC — la API no persiste zona horaria del visitante, y fingir
// una sería peor que ser explícito con "UTC" en la etiqueta.
export function kickoffTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
}

export function initials(name: string): string {
  const words = name.replace(/^(FC|CF|CD|CR|SC|AS|AC|US|KF|SK|FK|NK|KKS|PFC)\s+/i, '').split(/\s+/)
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase()
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// Color determinístico por nombre de competición — mismo nombre siempre
// cae en el mismo tono, sin mantener una tabla manual por liga.
const COMPETITION_HUES: [string, string][] = [
  ['champions', '#0E1E5B'],
  ['friendly', '#3A6B35'],
  ['brasileiro', '#005F3C'],
  ['argentin', '#6CACE4'],
  ['lpf', '#6CACE4'],
]

export function competitionColor(name: string): string {
  const lower = name.toLowerCase()
  for (const [needle, color] of COMPETITION_HUES) {
    if (lower.includes(needle)) return color
  }
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 38%)`
}

export function centsToMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function accuracyPct(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(1)}%`
}

export function timeUntil(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  if (diffMs <= 0) return '00:00:00'
  const totalSec = Math.floor(diffMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}
