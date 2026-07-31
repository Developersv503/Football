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

export type CompetitionOption = {
  id: string
  name: string
  country: string | null
  eventCount: number
}

export type LineupPlayer = {
  name: string
  jerseyNumber: number | null
  position: string | null
  starter: boolean
}

export type TeamLineup = {
  qualifier: 'home' | 'away'
  teamName: string
  formation: string | null
  manager: string | null
  players: LineupPlayer[]
}

export type MatchDetail = {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  status: EventCard['status']
  homeScore: number | null
  awayScore: number | null
  competition: { id: string; name: string; country: string | null }
  lineups: TeamLineup[] | null
  consensus: { total: number; home: number; draw: number; away: number }
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

// Por defecto `no-store` — los partidos en vivo cambian de estado en
// segundos, cachear acá mostraría marcadores viejos. Los endpoints que NO
// dependen del filtro de liga (competitions, torneo activo, ranking) pasan
// `revalidateSeconds` para evitar recargar en frío en cada click del filtro
// — la API en Hobby tarda ~3s por request fría, y antes se pagaban 2 rondas
// (Promise.all + el leaderboard secuencial) en cada navegación.
async function apiGet<T>(path: string, token?: string, revalidateSeconds?: number): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : { cache: 'no-store' }),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error(`API ${path} -> HTTP ${res.status}`)
  return res.json()
}

async function apiMutate<T>(
  method: 'POST' | 'PATCH' | 'PUT',
  path: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  // Fastify rechaza con 400 un Content-Type: application/json sin body —
  // el header solo va si realmente hay body que serializar.
  const res = await fetch(`${API_URL}${path}`, {
    method,
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

const apiPost = <T>(path: string, body?: unknown, token?: string) => apiMutate<T>('POST', path, body, token)
const apiPatch = <T>(path: string, body?: unknown, token?: string) => apiMutate<T>('PATCH', path, body, token)
const apiPut = <T>(path: string, body?: unknown, token?: string) => apiMutate<T>('PUT', path, body, token)

export function getTodayEvents(competitionId?: string) {
  const query = competitionId ? `&competitionId=${encodeURIComponent(competitionId)}` : ''
  return apiGet<CursorPage<EventCard>>(`/api/events?take=50${query}`)
}

export function getCompetitions() {
  return apiGet<CompetitionOption[]>('/api/competitions', undefined, 20)
}

export function getMatchDetail(eventId: string) {
  return apiGet<MatchDetail>(`/api/events/${eventId}/detail`)
}

// El listado general ordena por hora de inicio ascendente — con 70+ eventos
// reales de todo el día, los que están en vivo AHORA pueden quedar fuera del
// corte de 50. Se piden aparte para garantizar que siempre aparezcan.
export function getLiveEvents() {
  return apiGet<CursorPage<EventCard>>('/api/events?status=LIVE&take=20')
}

export function getActiveTournament() {
  return apiGet<CursorPage<TournamentCard>>('/api/tournaments?status=ACTIVE&take=1', undefined, 20)
}

export function getGlobalRanking(take = 5) {
  return apiGet<CursorPage<RankingRow>>(`/api/predictor-profiles/ranking?take=${take}`, undefined, 20)
}

export function getTournamentLeaderboard(tournamentId: string) {
  return apiGet<CursorPage<{ id: string; score: number; rank: number | null; user: { id: string; displayName: string } }>>(
    `/api/tournaments/${tournamentId}/leaderboard?take=50`,
    undefined,
    20,
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

export function getTournaments(status?: TournamentCard['status']) {
  return apiGet<CursorPage<TournamentCard>>(`/api/tournaments?take=50${status ? `&status=${status}` : ''}`)
}

export type PredictionRow = {
  id: string
  outcome: PredictionOutcome
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID'
  createdAt: string
  settledAt: string | null
  event: { id: string; homeTeam: string; awayTeam: string; startTime: string; status: EventCard['status'] }
}

export function getMyPredictions(token: string) {
  return apiGet<CursorPage<PredictionRow>>('/api/predictions/me?take=50', token)
}

// ──────────────────── Concurso de marcador exacto ──────────────────────

export type MatchContestStatus = 'OPEN' | 'LOCKED' | 'SETTLED'

export type MatchContest = {
  id: string
  eventId: string
  status: MatchContestStatus
  recommendedHomeScore: number | null
  recommendedAwayScore: number | null
  settledAt: string | null
  rewardTiers: { rank: number; points: number }[]
}

export type ScorePredictionRow = {
  id: string
  homeScore: number
  awayScore: number
  isExactMatch: boolean | null
  rank: number | null
  pointsAwarded: number
  createdAt: string
}

export type ScorePredictionLeaderboardRow = ScorePredictionRow & { user: { displayName: string } }

export function getMatchContest(eventId: string) {
  return apiGet<MatchContest>(`/api/match-contests/${eventId}`).catch(() => null)
}

export function getMatchContestLeaderboard(eventId: string, take = 10) {
  return apiGet<CursorPage<ScorePredictionLeaderboardRow>>(`/api/match-contests/${eventId}/leaderboard?take=${take}`)
}

export function getMyScorePrediction(token: string, eventId: string) {
  return apiGet<ScorePredictionRow | null>(`/api/match-contests/${eventId}/me`, token)
}

export function submitScorePrediction(token: string, eventId: string, homeScore: number, awayScore: number) {
  return apiPost<ScorePredictionRow>(`/api/match-contests/${eventId}/predict`, { homeScore, awayScore }, token)
}

// ───────────────────────── Puntos y canje ──────────────────────────────

export type RoundConfig = {
  id: string
  roundLabel: string
  targetPoints: number
  currency: string
  pointsPerCurrencyUnit: number
}

export type PointsLedgerEntry = { id: string; delta: number; reason: string; refId: string | null; createdAt: string }

export type PointsRedemptionStatus = 'REQUESTED' | 'CONTACTED' | 'PAID' | 'REJECTED'

export type PointsRedemption = {
  id: string
  userId: string
  pointsAmount: number
  contactPhone: string | null
  contactNote: string | null
  status: PointsRedemptionStatus
  requestedAt: string
  resolvedAt: string | null
}

export function getRoundConfig() {
  return apiGet<RoundConfig>('/api/points/round-config', undefined, 20)
}

export function getMyPointsBalance(token: string) {
  return apiGet<{ pointsBalance: number }>('/api/points/me', token)
}

export function getMyPointsLedger(token: string) {
  return apiGet<CursorPage<PointsLedgerEntry>>('/api/points/me/ledger?take=50', token)
}

export function requestRedemption(
  token: string,
  pointsAmount: number,
  contactPhone?: string,
  contactNote?: string,
) {
  return apiPost<PointsRedemption>('/api/points/redemptions', { pointsAmount, contactPhone, contactNote }, token)
}

// ──────────────────────────────── Admin ─────────────────────────────────

export type AdminDashboard = {
  totalUsers: number
  activeUsers: number
  pointsLiability: number
  pendingRedemptions: { count: number; points: number }
  predictionsToday: number
  scorePredictionsToday: number
  activeTournaments: number
  openMatchContests: number
}

export type AdminUserRow = {
  id: string
  email: string
  displayName: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  profile: { pointsBalance: number } | null
}

export type AdminRedemptionRow = PointsRedemption & { user: { displayName: string; email: string } }

export function adminGetDashboard(token: string) {
  return apiGet<AdminDashboard>('/api/admin/dashboard', token)
}

export function adminListUsers(token: string, cursor?: string) {
  return apiGet<CursorPage<AdminUserRow>>(`/api/admin/users?take=50${cursor ? `&cursor=${cursor}` : ''}`, token)
}

export function adminUpdateUser(token: string, id: string, dto: { isActive?: boolean; role?: 'USER' | 'ADMIN' }) {
  return apiPatch<AdminUserRow>(`/api/admin/users/${id}`, dto, token)
}

export function adminListRedemptions(token: string, status?: PointsRedemptionStatus) {
  return apiGet<CursorPage<AdminRedemptionRow>>(
    `/api/admin/points/redemptions?take=50${status ? `&status=${status}` : ''}`,
    token,
  )
}

export function adminResolveRedemption(token: string, id: string, status: 'CONTACTED' | 'PAID' | 'REJECTED') {
  return apiPatch<PointsRedemption>(`/api/admin/points/redemptions/${id}`, { status }, token)
}

export function adminAdjustUserPoints(token: string, userId: string, delta: number, note?: string) {
  return apiPatch<{ userId: string; pointsBalance: number }>(`/api/admin/points/users/${userId}/adjust`, { delta, note }, token)
}

export function adminSetRoundConfig(
  token: string,
  dto: { roundLabel?: string; targetPoints?: number; currency?: string; pointsPerCurrencyUnit?: number },
) {
  return apiPatch<RoundConfig>('/api/admin/points/round-config', dto, token)
}

export function adminEnsureMatchContest(token: string, eventId: string) {
  return apiPost<MatchContest>(`/api/admin/match-contests/${eventId}`, undefined, token)
}

export function adminSetRecommendedScore(token: string, eventId: string, homeScore: number, awayScore: number) {
  return apiPost<MatchContest>(`/api/admin/match-contests/${eventId}/recommended`, { homeScore, awayScore }, token)
}

export function adminSetRewardTiers(token: string, eventId: string, tiers: { rank: number; points: number }[]) {
  return apiPut<MatchContest>(`/api/admin/match-contests/${eventId}/reward-tiers`, { tiers }, token)
}

export function adminSettleMatchContest(token: string, eventId: string) {
  return apiPost<{ settled: boolean; winners: number }>(`/api/admin/match-contests/${eventId}/settle`, undefined, token)
}

export function adminCreateTournament(
  token: string,
  dto: {
    name: string
    type: TournamentCard['type']
    startAt: string
    endAt: string
    entryFeeCents?: number
    prizePoolCents?: number
  },
) {
  return apiPost<TournamentCard>('/api/admin/tournaments', dto, token)
}

export function adminUpdateTournament(
  token: string,
  id: string,
  dto: Partial<{
    name: string
    status: TournamentCard['status']
    startAt: string
    endAt: string
    entryFeeCents: number
    prizePoolCents: number
  }>,
) {
  return apiPatch<TournamentCard>(`/api/admin/tournaments/${id}`, dto, token)
}

export function adminUpdateEvent(
  token: string,
  id: string,
  dto: Partial<{ status: EventCard['status']; homeScore: number | null; awayScore: number | null }>,
) {
  return apiPatch<EventCard>(`/api/admin/events/${id}`, dto, token)
}
