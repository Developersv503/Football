const API_URL = process.env.API_URL ?? 'http://localhost:4000'

export type CursorPage<T> = { items: T[]; nextCursor: string | null }

export type EventCard = {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  homeScore: number | null
  awayScore: number | null
  predictionsCount: number
  sport: { key: string; name: string }
  competition: { id: string; name: string }
}

export type TournamentCard = {
  id: string
  name: string
  type: 'DAILY' | 'MONTHLY' | 'CUSTOM'
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'SETTLED'
  startAt: string
  endAt: string
  entryFeeCents: number
  prizePoolCents: number
}

export type RankingRow = {
  id: string
  userId: string
  rankScore: number
  totalPredictions: number
  accuracyBasisPoints: number
  currentStreak: number
  user: { displayName: string }
}

// Todas las páginas se renderizan en el servidor con `no-store` — los
// partidos/torneos cambian de estado en segundos (en vivo), cachear acá
// mostraría marcadores viejos. La API interna es la que decide qué cachear.
async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error(`API ${path} -> HTTP ${res.status}`)
  return res.json()
}

async function apiPost<T>(path: string, body?: unknown, token?: string): Promise<T> {
  // Fastify rechaza con 400 un Content-Type: application/json sin body —
  // el header solo va si realmente hay body que serializar.
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data && typeof data.message === 'string' ? data.message : `HTTP ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export function getTodayEvents() {
  return apiGet<CursorPage<EventCard>>('/api/events?take=50')
}

// El listado general ordena por hora de inicio ascendente — con 70+ eventos
// reales de todo el día, los que están en vivo AHORA pueden quedar fuera del
// corte de 50. Se piden aparte para garantizar que siempre aparezcan.
export function getLiveEvents() {
  return apiGet<CursorPage<EventCard>>('/api/events?status=LIVE&take=20')
}

export function getActiveTournament() {
  return apiGet<CursorPage<TournamentCard>>('/api/tournaments?status=ACTIVE&take=1')
}

export function getGlobalRanking(take = 5) {
  return apiGet<CursorPage<RankingRow>>(`/api/predictor-profiles/ranking?take=${take}`)
}

export function getTournamentLeaderboard(tournamentId: string) {
  return apiGet<CursorPage<{ id: string; score: number; rank: number | null; user: { id: string; displayName: string } }>>(
    `/api/tournaments/${tournamentId}/leaderboard?take=50`,
  )
}

export type AuthResponse = { accessToken: string }

export function registerUser(email: string, password: string, displayName: string) {
  return apiPost<AuthResponse>('/api/auth/register', { email, password, displayName })
}

export function loginUser(email: string, password: string) {
  return apiPost<AuthResponse>('/api/auth/login', { email, password })
}

export type MyProfile = {
  userId: string
  rankScore: number
  totalPredictions: number
  accuracyBasisPoints: number
  currentStreak: number
  user: { displayName: string }
}

export function getMyProfile(token: string) {
  return apiGet<MyProfile>('/api/predictor-profiles/me', token)
}

export type PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY'

export function createPrediction(token: string, eventId: string, outcome: PredictionOutcome) {
  return apiPost<{ id: string }>('/api/predictions', { eventId, outcome }, token)
}

export function joinTournament(token: string, tournamentId: string) {
  return apiPost<{ id: string }>(`/api/tournaments/${tournamentId}/join`, undefined, token)
}
