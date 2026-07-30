import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { getEnv } from '../../config/env'

const STATUS_MAP: Record<string, 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'> = {
  not_started: 'SCHEDULED',
  live: 'LIVE',
  closed: 'FINISHED',
  postponed: 'POSTPONED',
  cancelled: 'CANCELLED',
}

// Mismas competiciones reales que scripts/sync-today.cjs (trial Soccer, sin Odds).
const TARGET_COMPETITIONS = new Set([
  'sr:competition:7',
  'sr:competition:853',
  'sr:competition:325',
  'sr:competition:155',
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

  async syncToday(): Promise<{ synced: number; competitions: number }> {
    const apiKey = getEnv().SPORTRADAR_API_KEY
    if (!apiKey) {
      this.logger.warn('SPORTRADAR_API_KEY no configurada — se salta el sync.')
      return { synced: 0, competitions: 0 }
    }

    const today = new Date().toISOString().slice(0, 10)
    const [todaySchedule, liveSchedule] = await Promise.all([
      this.fetchJson(`https://api.sportradar.com/soccer/trial/v4/en/schedules/${today}/schedules.json?api_key=${apiKey}`),
      this.fetchJson(`https://api.sportradar.com/soccer/trial/v4/en/schedules/live/schedules.json?api_key=${apiKey}`),
    ])

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
      const comp = entry.sport_event.sport_event_context.competition
      let competition = competitionCache.get(comp.id)
      if (!competition) {
        competition = await this.prisma.competition.upsert({
          where: { sportradarId: comp.id },
          update: { name: comp.name, country: comp.category?.name ?? null },
          create: {
            sportradarId: comp.id,
            sportId: sport.id,
            name: comp.name,
            country: comp.category?.name ?? null,
          },
        })
        competitionCache.set(comp.id, competition)
      }
      await this.upsertEvent(sport.id, competition.id, entry)
      synced += 1
    }

    this.logger.log(`Sync: ${synced} eventos en ${competitionCache.size} competiciones.`)
    return { synced, competitions: competitionCache.size }
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

  private async fetchJson(url: string): Promise<any> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
    return res.json()
  }
}
