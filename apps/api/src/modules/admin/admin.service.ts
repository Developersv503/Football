import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type { ListUsersDto, ListAuditLogsDto, UpdateUserDto } from './admin.dto'

@Injectable()
export class AdminService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listUsers(dto: ListUsersDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: { select: { pointsBalance: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  // Suspender/reactivar cuenta (fraude/abuso) o cambiar rol — el dueño no
  // puede editar puntos/rachas acá, eso siempre pasa por PointsLedgerEntry.
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, displayName: true, role: true, isActive: true },
    })
  }

  // Vista rápida del panel: exposición real en puntos (lo que el dueño le
  // debe a los usuarios si todos canjean) + actividad del día.
  async dashboard() {
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)

    const [
      totalUsers,
      activeUsers,
      pointsLiability,
      pendingRedemptions,
      predictionsToday,
      scorePredictionsToday,
      activeTournaments,
      openMatchContests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.predictorProfile.aggregate({ _sum: { pointsBalance: true } }),
      this.prisma.pointsRedemption.aggregate({
        where: { status: { in: ['REQUESTED', 'CONTACTED'] } },
        _count: true,
        _sum: { pointsAmount: true },
      }),
      this.prisma.prediction.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.scorePrediction.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.tournament.count({ where: { status: 'ACTIVE' } }),
      this.prisma.matchContest.count({ where: { status: 'OPEN' } }),
    ])

    return {
      totalUsers,
      activeUsers,
      pointsLiability: pointsLiability._sum.pointsBalance ?? 0,
      pendingRedemptions: {
        count: pendingRedemptions._count,
        points: pendingRedemptions._sum.pointsAmount ?? 0,
      },
      predictionsToday,
      scorePredictionsToday,
      activeTournaments,
      openMatchContests,
    }
  }

  async listAuditLogs(dto: ListAuditLogsDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.auditLog.findMany({
      where: dto.entity ? { entity: dto.entity } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  /**
   * Liquida un torneo: asigna `rank` a todas sus entries en un solo UPDATE
   * set-based (RANK() OVER) en vez de traer N filas y actualizarlas una por
   * una desde Node — con miles de participantes, la diferencia es real.
   */
  async settleTournament(tournamentId: string): Promise<{ settled: number }> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { status: true },
    })
    if (!tournament) throw new NotFoundException('Torneo no encontrado')
    if (tournament.status === 'SETTLED') throw new BadRequestException('Ya estaba liquidado')

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.$executeRaw`
        UPDATE tournament_entries te
        SET rank = ranked.rnk
        FROM (
          SELECT id, RANK() OVER (ORDER BY score DESC) AS rnk
          FROM tournament_entries
          WHERE "tournamentId" = ${tournamentId}
        ) ranked
        WHERE te.id = ranked.id
      `
      await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'SETTLED' } })
      return updated
    })

    return { settled: result }
  }
}
