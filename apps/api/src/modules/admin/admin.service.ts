import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type { ListUsersDto, ListAuditLogsDto } from './admin.dto'

@Injectable()
export class AdminService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listUsers(dto: ListUsersDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.user.findMany({
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
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
