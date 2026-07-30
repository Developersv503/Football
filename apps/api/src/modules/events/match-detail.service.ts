import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { getEnv } from '../../config/env'

const SR_BASE = 'https://api.sportradar.com/soccer/trial/v4/en'

export interface LineupPlayer {
  name: string
  jerseyNumber: number | null
  position: string | null
  starter: boolean
}

export interface TeamLineup {
  qualifier: 'home' | 'away'
  teamName: string
  formation: string | null
  manager: string | null
  players: LineupPlayer[]
}

export interface Consensus {
  total: number
  home: number
  draw: number
  away: number
}

/**
 * Ficha del partido. Combina tres fuentes distintas y las mantiene
 * separadas a propósito: alineaciones de Sportradar (cacheadas), consenso
 * de nuestros propios pronosticadores, e historial cara a cara. El trial no
 * incluye el producto de probabilidades de Sportradar, así que el único
 * porcentaje que se muestra es el consenso real de la comunidad — nunca uno
 * estimado.
 */
@Injectable()
export class MatchDetailService {
  private readonly logger = new Logger(MatchDetailService.name)

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getDetail(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        sportradarId: true,
        homeTeam: true,
        awayTeam: true,
        startTime: true,
        status: true,
        homeScore: true,
        awayScore: true,
        predictionsCount: true,
        lineups: true,
        lineupsFetchedAt: true,
        competition: { select: { id: true, name: true, country: true } },
      },
    })
    if (!event) throw new NotFoundException('Evento no encontrado')

    const [lineups, consensus] = await Promise.all([
      this.resolveLineups(event),
      this.getConsensus(eventId),
    ])

    return {
      id: event.id,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      startTime: event.startTime,
      status: event.status,
      homeScore: event.homeScore,
      awayScore: event.awayScore,
      competition: event.competition,
      lineups,
      consensus,
    }
  }

  /** Cuenta cuántos pronosticaron cada resultado. Dato propio, no estimado. */
  private async getConsensus(eventId: string): Promise<Consensus> {
    const rows = await this.prisma.prediction.groupBy({
      by: ['outcome'],
      where: { eventId },
      _count: { outcome: true },
    })

    const counts = { home: 0, draw: 0, away: 0 }
    for (const row of rows) {
      if (row.outcome === 'HOME') counts.home = row._count.outcome
      if (row.outcome === 'DRAW') counts.draw = row._count.outcome
      if (row.outcome === 'AWAY') counts.away = row._count.outcome
    }

    return { ...counts, total: counts.home + counts.draw + counts.away }
  }

  /**
   * Sportradar solo publica las alineaciones ~1h antes del inicio, así que
   * no tiene sentido reintentar en cada visita: si ya están cacheadas se
   * devuelven, y si no, se piden una vez y se guardan. Un fallo del feed
   * devuelve `null` (el frontend muestra "no disponibles"), nunca rompe la
   * ficha entera.
   */
  private async resolveLineups(event: {
    id: string
    sportradarId: string
    lineups: unknown
    lineupsFetchedAt: Date | null
  }): Promise<TeamLineup[] | null> {
    if (event.lineups) return event.lineups as TeamLineup[]

    const apiKey = getEnv().SPORTRADAR_API_KEY
    if (!apiKey) return null

    try {
      const res = await fetch(
        `${SR_BASE}/sport_events/${event.sportradarId}/lineups.json?api_key=${apiKey}`,
      )
      if (!res.ok) return null

      const data: any = await res.json()
      const competitors = data?.lineups?.competitors
      if (!Array.isArray(competitors) || competitors.length === 0) return null

      const parsed = competitors.map(
        (c: any): TeamLineup => ({
          qualifier: c.qualifier,
          teamName: c.name,
          formation: c.formation?.type ?? null,
          manager: c.manager?.name ?? null,
          players: (c.players ?? []).map((p: any) => ({
            name: p.name,
            jerseyNumber: p.jersey_number ?? null,
            position: p.position ?? p.type ?? null,
            starter: Boolean(p.starter),
          })),
        }),
      )

      const hasPlayers = parsed.some((t) => t.players.length > 0)
      if (!hasPlayers) return null

      await this.prisma.event.update({
        where: { id: event.id },
        data: { lineups: parsed as any, lineupsFetchedAt: new Date() },
      })
      return parsed
    } catch (err) {
      this.logger.warn(`No se pudieron traer alineaciones de ${event.sportradarId}: ${(err as Error).message}`)
      return null
    }
  }
}
