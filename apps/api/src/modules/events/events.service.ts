import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma, PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type { AdminUpdateEventDto, ListEventsDto } from './events.dto'

// Solo los campos que la tarjeta de evento necesita — evita traer columnas
// de más en un listado que puede correr miles de veces por día.
const EVENT_CARD_SELECT = {
  id: true,
  homeTeam: true,
  awayTeam: true,
  startTime: true,
  status: true,
  homeScore: true,
  awayScore: true,
  predictionsCount: true,
  sport: { select: { key: true, name: true } },
  competition: { select: { id: true, name: true } },
} satisfies Prisma.EventSelect

@Injectable()
export class EventsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(dto: ListEventsDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)

    // Filtro compuesto — cada rama usada acá calza con un índice de schema.prisma
    // (sportId+startTime, competitionId+startTime, status+startTime).
    const where: Prisma.EventWhereInput = {
      ...(dto.sportKey && { sport: { key: dto.sportKey } }),
      ...(dto.competitionId && { competitionId: dto.competitionId }),
      ...(dto.status && { status: dto.status }),
      ...((dto.from || dto.to) && {
        startTime: { ...(dto.from && { gte: dto.from }), ...(dto.to && { lte: dto.to }) },
      }),
    }

    const rows = await this.prisma.event.findMany({
      where,
      select: EVENT_CARD_SELECT,
      orderBy: [{ startTime: 'asc' }, { id: 'asc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })

    return buildCursorPage(rows, take)
  }

  async getById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        ...EVENT_CARD_SELECT,
        odds: {
          select: { bookmaker: true, market: true, homeOdds: true, drawOdds: true, awayOdds: true },
        },
      },
    })
    if (!event) throw new NotFoundException('Evento no encontrado')
    return event
  }

  async adminUpdate(id: string, dto: AdminUpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id }, select: { id: true } })
    if (!event) throw new NotFoundException('Evento no encontrado')
    return this.prisma.event.update({ where: { id }, data: dto, select: EVENT_CARD_SELECT })
  }
}
