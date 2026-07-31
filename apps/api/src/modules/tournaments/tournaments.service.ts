import { ConflictException, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { Prisma, type PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type { CreateTournamentDto, ListTournamentsDto, LeaderboardDto, UpdateTournamentDto } from './tournaments.dto'

@Injectable()
export class TournamentsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(dto: ListTournamentsDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.tournament.findMany({
      where: dto.status ? { status: dto.status } : undefined,
      orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  async getById(id: string) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } })
    if (!tournament) throw new NotFoundException('Torneo no encontrado')
    return tournament
  }

  async leaderboard(id: string, dto: LeaderboardDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.tournamentEntry.findMany({
      where: { tournamentId: id },
      select: {
        id: true,
        score: true,
        rank: true,
        user: { select: { id: true, displayName: true } },
      },
      orderBy: [{ score: 'desc' }, { id: 'asc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  async join(tournamentId: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { status: true },
    })
    if (!tournament) throw new NotFoundException('Torneo no encontrado')
    if (tournament.status !== 'UPCOMING' && tournament.status !== 'ACTIVE') {
      throw new BadRequestException('Este torneo ya no admite inscripciones')
    }

    try {
      return await this.prisma.tournamentEntry.create({ data: { tournamentId, userId } })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ya estás inscrito en este torneo')
      }
      throw err
    }
  }

  // ─────────────────────────────── Admin ───────────────────────────────

  create(dto: CreateTournamentDto) {
    if (dto.endAt <= dto.startAt) throw new BadRequestException('endAt debe ser posterior a startAt')
    return this.prisma.tournament.create({ data: dto })
  }

  async update(id: string, dto: UpdateTournamentDto) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id }, select: { id: true } })
    if (!tournament) throw new NotFoundException('Torneo no encontrado')
    return this.prisma.tournament.update({ where: { id }, data: dto })
  }
}
