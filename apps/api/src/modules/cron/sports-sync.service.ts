import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { getEnv } from '../../config/env'
import {
  fetchGoalserveOddsForDate,
  normalizeTeamName,
  toGoalserveDate,
} from './providers/goalserve-odds.provider'

const STATUS_MAP: Record<string, 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'> = {
  not_started: 'SCHEDULED',
  live: 'LIVE',
  closed: 'FINISHED',
  postponed: 'POSTPONED',
  cancelled: 'CANCELLED',
}

// Competiciones que se ingestan. Las europeas top son el objetivo del
// producto, pero de junio a agosto están fuera de temporada y no devuelven
// fixtures — por eso van también las ligas sudamericanas y los amistosos,
// que sí tienen partidos en esa ventana y evitan que la home quede vacía.
const TARGET_COMPETITIONS = new Set([
  'sr:competition:8', // LaLiga (España)
  'sr:competition:17', // Premier League (Inglaterra)
  'sr:competition:23', // Serie A (Italia)
  'sr:competition:35', // Bundesliga (Alemania)
  'sr:competition:34', // Ligue 1 (Francia)
  'sr:competition:7', // UEFA Champions League
  'sr:competition:679', // UEFA Europa League
  'sr:competition:329', // Copa del Rey (España)
  'sr:competition:325', // Brasileiro Serie A
  'sr:competition:155', // Primera LPF (Argentina)
  'sr:competition:853', // Club Friendly Games
])

/**
 * Versión TS del stand-in manual `scripts/sync-today.cjs`, pensada para
 * correr desde el cron de Vercel en vez de a mano. Misma lógica de upsert,
 * reutiliza el PrismaClient inyectado (pool ya abierto) en vez de crear uno
 * nuevo por invocación.
 */
@Injectable()
export class SportsSyncService {
  private readonly logger = new Logger(SportsSyncService.name)

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async syncToday(): Promise<{
    synced: number
    competitions: number
    odds: { matched: number; unmatched: number }
  }> {
    const apiKey = getEnv().SPORTRADAR_API_KEY
    if (!apiKey) {
      this.logger.warn('SPORTRADAR_API_KEY no configurada — se salta el sync.')
      return { synced: 0, competitions: 0, odds: { matched: 0, unmatched: 0 } }
    }

    // El trial de Sportradar es 1 QPS — pedir estos dos (y el catálogo del
    // backfill, más abajo) en paralelo dispara un 429 real. Secuencial con
    // pausa entre llamadas, no Promise.all.
    const today = new Date().toISOString().slice(0, 10)
    const todaySchedule = await this.fetchJson(
      `https://api.sportradar.com/soccer/trial/v4/en/schedules/${today}/schedules.json?api_key=${apiKey}`,
    )
    await this.sleep(1100)
    const liveSchedule = await this.fetchJson(
      `https://api.sportradar.com/soccer/trial/v4/en/schedules/live/schedules.json?api_key=${apiKey}`,
    )

    const sport = await this.prisma.sport.upsert({
      where: { key: 'soccer' },
      update: {},
      create: { key: 'soccer', name: 'Fútbol' },
    })

    const byId = new Map<string, any>()
    for (const e of [...todaySchedule.schedules, ...liveSchedule.schedules]) {
      byId.set(e.sport_event.id, e)
    }
    const relevant = [...byId.values()].filter((e) =>
      TARGET_COMPETITIONS.has(e.sport_event.sport_event_context.competition.id),
    )

    const competitionCache = new Map<string, { id: string }>()
    let synced = 0

    for (const entry of relevant) {
      const context = entry.sport_event.sport_event_context
      const comp = context.competition
      // `category` (el país o "International Clubs") es hermano de
      // `competition` dentro de sport_event_context, no un campo anidado
      // en él — leerlo del lugar equivocado dejaba el país siempre nulo.
      const country = context.category?.name ?? null

      let competition = competitionCache.get(comp.id)
      if (!competition) {
        competition = await this.prisma.competition.upsert({
          where: { sportradarId: comp.id },
          update: { name: comp.name, country },
          create: {
            sportradarId: comp.id,
            sportId: sport.id,
            name: comp.name,
            country,
          },
        })
        competitionCache.set(comp.id, competition)
      }
      await this.upsertEvent(sport.id, competition.id, entry)
      synced += 1
    }

    this.logger.log(`Sync: ${synced} eventos en ${competitionCache.size} competiciones.`)
    await this.backfillMissingCountries(apiKey)

    const odds = await this.syncGoalserveOdds()

    return { synced, competitions: competitionCache.size, odds }
  }

  /**
   * Goalserve y Sportradar no comparten ids — matchea por nombre de equipo
   * normalizado + fecha del feed (mismo formato DD.MM.YYYY en ambos lados).
   * Si no matchea, se descarta esa fila de odds y se cuenta en `unmatched`
   * (visible en el log — señal de que el matching por nombre necesita ajuste,
   * no un fallo silencioso).
   */
  private async syncGoalserveOdds(): Promise<{ matched: number; unmatched: number }> {
    const apiKey = getEnv().GOALSERVE_API_KEY
    if (!apiKey) {
      this.logger.warn('GOALSERVE_API_KEY no configurada — se salta el sync de odds.')
      return { matched: 0, unmatched: 0 }
    }

    const today = new Date()
    const dateKey = toGoalserveDate(today)

    let oddsMatches: Awaited<ReturnType<typeof fetchGoalserveOddsForDate>>
    try {
      oddsMatches = await fetchGoalserveOddsForDate(apiKey, dateKey)
    } catch (err) {
      this.logger.warn(`No se pudo traer odds de Goalserve: ${(err as Error).message}`)
      return { matched: 0, unmatched: 0 }
    }

    const dayStart = new Date(today)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const todayEvents = await this.prisma.event.findMany({
      where: { startTime: { gte: dayStart, lt: dayEnd } },
      select: { id: true, homeTeam: true, awayTeam: true },
    })

    const eventByKey = new Map<string, { id: string }>()
    for (const event of todayEvents) {
      const key = `${normalizeTeamName(event.homeTeam)}|${normalizeTeamName(event.awayTeam)}`
      eventByKey.set(key, event)
    }

    let matched = 0
    let unmatched = 0

    for (const oddsMatch of oddsMatches) {
      const key = `${normalizeTeamName(oddsMatch.homeTeamRaw)}|${normalizeTeamName(oddsMatch.awayTeamRaw)}`
      const event = eventByKey.get(key)
      if (!event) {
        unmatched += 1
        continue
      }

      await this.prisma.event.update({
        where: { id: event.id },
        data: { goalserveId: oddsMatch.goalserveId },
      })

      for (const bm of oddsMatch.bookmakers) {
        if (!bm.home || !bm.draw || !bm.away) continue
        await this.prisma.odds.upsert({
          where: { eventId_bookmaker_market: { eventId: event.id, bookmaker: bm.bookmaker, market: '1x2' } },
          update: { homeOdds: bm.home, drawOdds: bm.draw, awayOdds: bm.away },
          create: {
            eventId: event.id,
            bookmaker: bm.bookmaker,
            market: '1x2',
            homeOdds: bm.home,
            drawOdds: bm.draw,
            awayOdds: bm.away,
          },
        })
      }
      matched += 1
    }

    this.logger.log(`Odds Goalserve: ${matched} partidos matcheados, ${unmatched} sin match.`)
    return { matched, unmatched }
  }

  /**
   * Una competición solo recibe país cuando aparece en el sync del día
   * (ver arriba) — si esa liga no tiene fixtures hoy, se queda con lo que
   * ya tenía guardado, aunque sea null (p. ej. quedó null antes del fix del
   * bug de arriba, o se creó un día sin partidos de esa liga). Este paso
   * usa el catálogo completo de Sportradar, que sí trae el país en cada
   * competición sin depender de si tiene partidos hoy, y rellena solo lo
   * que falta.
   */
  private async backfillMissingCountries(apiKey: string): Promise<void> {
    const missing = await this.prisma.competition.findMany({
      where: { country: null },
      select: { id: true, sportradarId: true },
    })
    if (missing.length === 0) return

    let catalog: any[]
    try {
      await this.sleep(1100)
      const data = await this.fetchJson(
        `https://api.sportradar.com/soccer/trial/v4/en/competitions.json?api_key=${apiKey}`,
      )
      catalog = data.competitions ?? []
    } catch (err) {
      this.logger.warn(`No se pudo traer el catálogo para el backfill de país: ${(err as Error).message}`)
      return
    }

    const countryById = new Map<string, string>()
    for (const comp of catalog) {
      if (comp.category?.name) countryById.set(comp.id, comp.category.name)
    }

    let updated = 0
    for (const comp of missing) {
      const country = countryById.get(comp.sportradarId)
      if (!country) continue
      await this.prisma.competition.update({ where: { id: comp.id }, data: { country } })
      updated += 1
    }
    if (updated > 0) this.logger.log(`Backfill de país: ${updated} competiciones actualizadas.`)
  }

  private async upsertEvent(sportId: string, competitionId: string, entry: any): Promise<void> {
    const { sport_event, sport_event_status } = entry
    const home = sport_event.competitors.find((c: any) => c.qualifier === 'home')
    const away = sport_event.competitors.find((c: any) => c.qualifier === 'away')
    const status = STATUS_MAP[sport_event_status.status] ?? 'SCHEDULED'

    await this.prisma.event.upsert({
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async fetchJson(url: string): Promise<any> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
    return res.json()
  }
}
