// Ingesta puntual de partidos REALES de hoy desde Sportradar (trial Soccer)
// hacia Sport/Competition/Event. Es un stand-in manual del futuro worker
// `sports-sync` (BullMQ en GCP) — mismo modelo de datos, ejecutado una vez
// a mano para poblar el frontend con datos reales antes de que el worker
// exista.
//
// Uso: node --env-file=.env scripts/sync-today.cjs
const { PrismaClient } = require('../packages/db/generated/client/index.js')

const prisma = new PrismaClient()
const API_KEY = process.env.SPORTRADAR_API_KEY
if (!API_KEY) {
  console.error('Falta SPORTRADAR_API_KEY en .env')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

// Competiciones reales con partidos hoy (julio = fuera de temporada para
// LaLiga/Premier — se usan las que sí tienen fixtures reales ahora mismo).
// El trial de Soccer no incluye Odds, así que no se ingestan cuotas — el
// frontend debe mostrar "N/D" en vez de inventar números.
const TARGET_COMPETITIONS = new Set([
  'sr:competition:7', // UEFA Champions League (clasificación)
  'sr:competition:853', // Club Friendly Games (Liverpool, Dortmund, Leverkusen, Tottenham...)
  'sr:competition:325', // Brasileiro Serie A (Flamengo vs Internacional, en vivo)
  'sr:competition:155', // Primera LPF Argentina (River Plate, en vivo)
])

const STATUS_MAP = {
  not_started: 'SCHEDULED',
  live: 'LIVE',
  closed: 'FINISHED',
  postponed: 'POSTPONED',
  cancelled: 'CANCELLED',
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  return res.json()
}

async function upsertSport(sr) {
  return prisma.sport.upsert({
    where: { key: 'soccer' },
    update: {},
    create: { key: 'soccer', name: 'Fútbol' },
  })
}

async function upsertCompetition(sportId, comp, country) {
  return prisma.competition.upsert({
    where: { sportradarId: comp.id },
    update: { name: comp.name, country },
    create: {
      sportradarId: comp.id,
      sportId,
      name: comp.name,
      country,
    },
  })
}

async function upsertEvent(sportId, competitionId, entry) {
  const { sport_event, sport_event_status } = entry
  const home = sport_event.competitors.find((c) => c.qualifier === 'home')
  const away = sport_event.competitors.find((c) => c.qualifier === 'away')
  const status = STATUS_MAP[sport_event_status.status] ?? 'SCHEDULED'

  await prisma.event.upsert({
    where: { sportradarId: sport_event.id },
    update: {
      status,
      homeScore: sport_event_status.home_score ?? null,
      awayScore: sport_event_status.away_score ?? null,
      startTime: new Date(sport_event.start_time),
    },
    create: {
      sportradarId: sport_event.id,
      sportId,
      competitionId,
      homeTeam: home?.name ?? 'TBD',
      awayTeam: away?.name ?? 'TBD',
      startTime: new Date(sport_event.start_time),
      status,
      homeScore: sport_event_status.home_score ?? null,
      awayScore: sport_event_status.away_score ?? null,
    },
  })
}

async function main() {
  console.log(`Sincronizando fixtures reales de hoy (${today}) desde Sportradar...`)

  const [todaySchedule, liveSchedule] = await Promise.all([
    fetchJson(`https://api.sportradar.com/soccer/trial/v4/en/schedules/${today}/schedules.json?api_key=${API_KEY}`),
    fetchJson(`https://api.sportradar.com/soccer/trial/v4/en/schedules/live/schedules.json?api_key=${API_KEY}`),
  ])

  const sport = await upsertSport()

  // Merge: todo lo de hoy + lo que esté en vivo ahora mismo (puede incluir
  // eventos de "ayer" en husos horarios distintos), dedupe por id.
  const byId = new Map()
  for (const e of [...todaySchedule.schedules, ...liveSchedule.schedules]) {
    byId.set(e.sport_event.id, e)
  }

  const relevant = [...byId.values()].filter((e) =>
    TARGET_COMPETITIONS.has(e.sport_event.sport_event_context.competition.id),
  )

  console.log(`${relevant.length} eventos reales encontrados en competiciones objetivo.`)

  const competitionCache = new Map()
  let created = 0

  for (const entry of relevant) {
    const context = entry.sport_event.sport_event_context
    const comp = context.competition
    // `category` (país) es hermano de `competition`, no un campo anidado.
    const country = context.category?.name ?? null
    let competition = competitionCache.get(comp.id)
    if (!competition) {
      competition = await upsertCompetition(sport.id, comp, country)
      competitionCache.set(comp.id, competition)
    }
    await upsertEvent(sport.id, competition.id, entry)
    created += 1
  }

  console.log(`✓ ${created} eventos sincronizados (upsert) en ${competitionCache.size} competiciones.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
