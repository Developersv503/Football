import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type { GlobalRankingDto } from './predictor-profiles.dto'

@Injectable()
export class PredictorProfilesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  // Lookup directo por PK — nunca un aggregate sobre Prediction. Los
  // contadores ya vienen actualizados por el worker de liquidación.
  async getByUserId(userId: string) {
    const profile = await this.prisma.predictorProfile.findUnique({
      where: { userId },
      include: { user: { select: { displayName: true } } },
    })
    if (!profile) throw new NotFoundException('Perfil no encontrado')
    return profile
  }

  async globalRanking(dto: GlobalRankingDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.predictorProfile.findMany({
      select: {
        userId: true,
        rankScore: true,
        totalPredictions: true,
        accuracyBasisPoints: true,
        currentStreak: true,
        user: { select: { displayName: true } },
      },
      orderBy: [{ rankScore: 'desc' }, { userId: 'asc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { userId: dto.cursor } }),
    })
    // buildCursorPage espera `id` — el cursor de este modelo es `userId`, se remapea.
    return buildCursorPage(
      rows.map((r) => ({ ...r, id: r.userId })),
      take,
    )
  }
}
