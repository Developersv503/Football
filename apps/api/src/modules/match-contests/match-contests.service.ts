import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, type PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type {
  LeaderboardQueryDto,
  SetRecommendedScoreDto,
  SetRewardTiersDto,
  SubmitScorePredictionDto,
} from './match-contests.dto'

const CONTEST_SELECT = {
  id: true,
  eventId: true,
  status: true,
  recommendedHomeScore: true,
  recommendedAwayScore: true,
  settledAt: true,
  rewardTiers: { select: { rank: true, points: true }, orderBy: { rank: 'asc' as const } },
} satisfies Prisma.MatchContestSelect

@Injectable()
export class MatchContestsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getByEventId(eventId: string) {
    const contest = await this.prisma.matchContest.findUnique({
      where: { eventId },
      select: CONTEST_SELECT,
    })
    if (!contest) throw new NotFoundException('Este partido no tiene concurso de marcador exacto')
    return contest
  }

  async myPrediction(eventId: string, userId: string) {
    const contest = await this.prisma.matchContest.findUnique({ where: { eventId }, select: { id: true } })
    if (!contest) throw new NotFoundException('Este partido no tiene concurso de marcador exacto')

    return this.prisma.scorePrediction.findUnique({
      where: { matchContestId_userId: { matchContestId: contest.id, userId } },
      select: { id: true, homeScore: true, awayScore: true, isExactMatch: true, rank: true, pointsAwarded: true, createdAt: true },
    })
  }

  async leaderboard(eventId: string, dto: LeaderboardQueryDto): Promise<CursorPage<any>> {
    const contest = await this.prisma.matchContest.findUnique({ where: { eventId }, select: { id: true } })
    if (!contest) throw new NotFoundException('Este partido no tiene concurso de marcador exacto')

    const take = clampPageSize(dto.take)
    const rows = await this.prisma.scorePrediction.findMany({
      where: { matchContestId: contest.id, isExactMatch: true },
      select: {
        id: true,
        homeScore: true,
        awayScore: true,
        rank: true,
        pointsAwarded: true,
        createdAt: true,
        user: { select: { displayName: true } },
      },
      orderBy: [{ rank: 'asc' }, { id: 'asc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  async predict(eventId: string, userId: string, dto: SubmitScorePredictionDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, startTime: true },
    })
    if (!event) throw new NotFoundException('Evento no encontrado')
    if (event.status !== 'SCHEDULED' || event.startTime <= new Date()) {
      throw new BadRequestException('El evento ya empezó o no admite pronósticos')
    }

    const contest = await this.prisma.matchContest.findUnique({ where: { eventId }, select: { id: true, status: true } })
    if (!contest) throw new NotFoundException('Este partido no tiene concurso de marcador exacto')
    if (contest.status !== 'OPEN') throw new BadRequestException('Este concurso ya no admite pronósticos')

    try {
      return await this.prisma.scorePrediction.create({
        data: { matchContestId: contest.id, userId, homeScore: dto.homeScore, awayScore: dto.awayScore },
      })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ya pronosticaste el marcador de este partido')
      }
      throw err
    }
  }

  // ─────────────────────────────── Admin ───────────────────────────────

  async ensureContest(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, select: { id: true } })
    if (!event) throw new NotFoundException('Evento no encontrado')

    await this.prisma.matchContest.upsert({
      where: { eventId },
      create: { eventId },
      update: {},
    })
    return this.getByEventId(eventId)
  }

  async setRecommendedScore(eventId: string, dto: SetRecommendedScoreDto) {
    await this.ensureContest(eventId)
    await this.prisma.matchContest.update({
      where: { eventId },
      data: { recommendedHomeScore: dto.homeScore, recommendedAwayScore: dto.awayScore },
    })
    return this.getByEventId(eventId)
  }

  async setRewardTiers(eventId: string, dto: SetRewardTiersDto) {
    const contest = await this.ensureContest(eventId)
    await this.prisma.$transaction([
      this.prisma.matchContestRewardTier.deleteMany({ where: { matchContestId: contest.id } }),
      this.prisma.matchContestRewardTier.createMany({
        data: dto.tiers.map((t) => ({ matchContestId: contest.id, rank: t.rank, points: t.points })),
      }),
    ])
    return this.getByEventId(eventId)
  }

  /**
   * Liquida un concurso: compara cada pronóstico contra el marcador real,
   * ordena a los que acertaron EXACTO por quién lo mandó primero, reparte
   * puntos según los tramos (`MatchContestRewardTier`) configurados por el
   * admin, y acredita el saldo (`PredictorProfile.pointsBalance`) + deja
   * rastro en `PointsLedgerEntry`. Todo en una transacción — o se liquida
   * completo, o no se toca nada.
   */
  async settleOne(eventId: string): Promise<{ settled: boolean; winners: number }> {
    const contest = await this.prisma.matchContest.findUnique({
      where: { eventId },
      include: { event: { select: { status: true, homeScore: true, awayScore: true } } },
    })
    if (!contest) throw new NotFoundException('Este partido no tiene concurso de marcador exacto')
    if (contest.status === 'SETTLED') return { settled: false, winners: 0 }
    if (contest.event.status !== 'FINISHED' || contest.event.homeScore == null || contest.event.awayScore == null) {
      throw new BadRequestException('El partido todavía no terminó')
    }

    const { homeScore, awayScore } = contest.event

    const winners = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE score_predictions
        SET "isExactMatch" = false, rank = NULL, "pointsAwarded" = 0
        WHERE "matchContestId" = ${contest.id}
      `
      await tx.$executeRaw`
        WITH exact AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id ASC) AS rnk
          FROM score_predictions
          WHERE "matchContestId" = ${contest.id}
            AND "homeScore" = ${homeScore}
            AND "awayScore" = ${awayScore}
        )
        UPDATE score_predictions sp
        SET "isExactMatch" = true,
            rank = exact.rnk,
            "pointsAwarded" = COALESCE(
              (SELECT points FROM match_contest_reward_tiers t
               WHERE t."matchContestId" = ${contest.id} AND t.rank = exact.rnk),
              0
            )
        FROM exact
        WHERE sp.id = exact.id
      `

      const paid = await tx.scorePrediction.findMany({
        where: { matchContestId: contest.id, pointsAwarded: { gt: 0 } },
        select: { id: true, userId: true, pointsAwarded: true },
      })

      if (paid.length > 0) {
        await tx.pointsLedgerEntry.createMany({
          data: paid.map((p) => ({
            userId: p.userId,
            delta: p.pointsAwarded,
            reason: 'MATCH_CONTEST_WIN',
            refId: p.id,
          })),
        })
        await Promise.all(
          paid.map((p) =>
            tx.predictorProfile.update({
              where: { userId: p.userId },
              data: { pointsBalance: { increment: p.pointsAwarded } },
            }),
          ),
        )
      }

      await tx.matchContest.update({ where: { id: contest.id }, data: { status: 'SETTLED', settledAt: new Date() } })

      return paid.length
    })

    return { settled: true, winners }
  }

  /** Corre desde el cron: liquida todos los concursos cuyo partido ya terminó. */
  async settleAllDue(): Promise<{ contestsSettled: number }> {
    const due = await this.prisma.matchContest.findMany({
      where: { status: { in: ['OPEN', 'LOCKED'] }, event: { status: 'FINISHED' } },
      select: { eventId: true },
    })

    let contestsSettled = 0
    for (const { eventId } of due) {
      const result = await this.settleOne(eventId)
      if (result.settled) contestsSettled += 1
    }
    return { contestsSettled }
  }
}
