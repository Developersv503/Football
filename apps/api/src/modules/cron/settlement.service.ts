import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PredictionOutcome, PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { AdminService } from '../admin/admin.service'

/**
 * Liquida pronósticos de eventos ya terminados y propaga el resultado al
 * score de los torneos activos. Corre desde el cron (ver CronController),
 * nunca desde un request de usuario.
 */
@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name)

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly adminService: AdminService,
  ) {}

  async settlePredictions(): Promise<{ eventsSettled: number; predictionsSettled: number }> {
    const events = await this.prisma.event.findMany({
      where: {
        status: { in: ['FINISHED', 'CANCELLED'] },
        predictions: { some: { status: 'PENDING' } },
      },
      select: { id: true, status: true, startTime: true, homeScore: true, awayScore: true },
    })

    let predictionsSettled = 0

    for (const event of events) {
      const pending = await this.prisma.prediction.findMany({
        where: { eventId: event.id, status: 'PENDING' },
        select: { id: true, userId: true, outcome: true },
      })
      if (pending.length === 0) continue

      if (event.status === 'CANCELLED') {
        await this.prisma.prediction.updateMany({
          where: { id: { in: pending.map((p) => p.id) } },
          data: { status: 'VOID', settledAt: new Date() },
        })
        predictionsSettled += pending.length
        continue
      }

      if (event.homeScore == null || event.awayScore == null) continue

      const actual: PredictionOutcome =
        event.homeScore > event.awayScore ? 'HOME' : event.homeScore < event.awayScore ? 'AWAY' : 'DRAW'

      const winners = pending.filter((p) => p.outcome === actual)
      const losers = pending.filter((p) => p.outcome !== actual)

      if (winners.length > 0) {
        await this.prisma.prediction.updateMany({
          where: { id: { in: winners.map((p) => p.id) } },
          data: { status: 'WON', settledAt: new Date() },
        })
      }
      if (losers.length > 0) {
        await this.prisma.prediction.updateMany({
          where: { id: { in: losers.map((p) => p.id) } },
          data: { status: 'LOST', settledAt: new Date() },
        })
      }
      predictionsSettled += pending.length

      if (winners.length > 0) {
        const winnerIds = [...new Set(winners.map((p) => p.userId))]
        // Set-based: suma 1 al score de cada torneo ACTIVO cuya ventana
        // [startAt,endAt] cubre el evento, para cada usuario que acertó.
        await this.prisma.$executeRaw`
          UPDATE tournament_entries te
          SET score = te.score + 1
          FROM tournaments t
          WHERE te."tournamentId" = t.id
            AND te."userId" = ANY(${winnerIds}::text[])
            AND t.status = 'ACTIVE'
            AND t."startAt" <= ${event.startTime}
            AND t."endAt" >= ${event.startTime}
        `
        // accuracyBasisPoints se recalcula con los contadores YA incrementados
        // (por eso el +1 va también dentro del cociente, no solo en el SET).
        await this.prisma.$executeRaw`
          UPDATE predictor_profiles
          SET "totalPredictions" = "totalPredictions" + 1,
              "correctPredictions" = "correctPredictions" + 1,
              "currentStreak" = "currentStreak" + 1,
              "rankScore" = "rankScore" + 1,
              "accuracyBasisPoints" = ROUND((("correctPredictions" + 1)::numeric / ("totalPredictions" + 1)) * 10000),
              "updatedAt" = now()
          WHERE "userId" = ANY(${winnerIds}::text[])
        `
      }

      if (losers.length > 0) {
        const loserIds = [...new Set(losers.map((p) => p.userId))]
        // Racha se corta acá — sin esto currentStreak nunca vuelve a cero.
        await this.prisma.$executeRaw`
          UPDATE predictor_profiles
          SET "totalPredictions" = "totalPredictions" + 1,
              "currentStreak" = 0,
              "accuracyBasisPoints" = ROUND(("correctPredictions"::numeric / ("totalPredictions" + 1)) * 10000),
              "updatedAt" = now()
          WHERE "userId" = ANY(${loserIds}::text[])
        `
      }
    }

    if (events.length > 0) {
      this.logger.log(`Liquidados ${predictionsSettled} pronósticos de ${events.length} eventos.`)
    }
    return { eventsSettled: events.length, predictionsSettled }
  }

  async autoTransitionTournaments(): Promise<{ activated: number; settled: number }> {
    const now = new Date()

    const activated = await this.prisma.tournament.updateMany({
      where: { status: 'UPCOMING', startAt: { lte: now } },
      data: { status: 'ACTIVE' },
    })

    const due = await this.prisma.tournament.findMany({
      where: { status: 'ACTIVE', endAt: { lte: now } },
      select: { id: true },
    })

    let settled = 0
    for (const tournament of due) {
      try {
        await this.adminService.settleTournament(tournament.id)
        settled += 1
      } catch (err) {
        this.logger.error(`No se pudo liquidar torneo ${tournament.id}: ${(err as Error).message}`)
      }
    }

    return { activated: activated.count, settled }
  }
}
