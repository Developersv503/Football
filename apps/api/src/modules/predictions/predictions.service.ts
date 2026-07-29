import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, type PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type { CreatePredictionDto, ListMyPredictionsDto } from './predictions.dto'

@Injectable()
export class PredictionsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(userId: string, dto: CreatePredictionDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: { id: true, status: true, startTime: true },
    })
    if (!event) throw new NotFoundException('Evento no encontrado')
    if (event.status !== 'SCHEDULED' || event.startTime <= new Date()) {
      throw new BadRequestException('El evento ya empezó o no admite pronósticos')
    }

    try {
      // Transacción: crear el pronóstico + incrementar el contador denormalizado
      // del evento son atómicos — o pasan las dos, o ninguna.
      const [prediction] = await this.prisma.$transaction([
        this.prisma.prediction.create({
          data: { userId, eventId: dto.eventId, outcome: dto.outcome },
        }),
        this.prisma.event.update({
          where: { id: dto.eventId },
          data: { predictionsCount: { increment: 1 } },
        }),
      ])
      return prediction
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ya tenés un pronóstico para este evento')
      }
      throw err
    }
  }

  async listMine(userId: string, dto: ListMyPredictionsDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)

    const rows = await this.prisma.prediction.findMany({
      where: { userId, ...(dto.status && { status: dto.status }) },
      select: {
        id: true,
        outcome: true,
        status: true,
        createdAt: true,
        settledAt: true,
        event: { select: { id: true, homeTeam: true, awayTeam: true, startTime: true, status: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })

    return buildCursorPage(rows, take)
  }
}
