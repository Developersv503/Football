import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import { buildCursorPage, clampPageSize, type CursorPage } from '../../common/pagination/cursor-pagination.util'
import type {
  AdjustPointsDto,
  ListLedgerDto,
  ListRedemptionsDto,
  RequestRedemptionDto,
  ResolveRedemptionDto,
  SetRoundConfigDto,
} from './points.dto'

const ROUND_CONFIG_ID = 'current'

@Injectable()
export class PointsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getMyBalance(userId: string) {
    const profile = await this.prisma.predictorProfile.findUnique({
      where: { userId },
      select: { pointsBalance: true },
    })
    if (!profile) throw new NotFoundException('Perfil no encontrado')
    return profile
  }

  async listMyLedger(userId: string, dto: ListLedgerDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.pointsLedgerEntry.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  // Sin pasarela de pago: esto solo reserva los puntos (descuenta saldo) y
  // deja la solicitud para que el dueño contacte al usuario y transfiera
  // por fuera de la plataforma. Si rechaza, se reintegran los puntos.
  async requestRedemption(userId: string, dto: RequestRedemptionDto) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.predictorProfile.findUnique({ where: { userId }, select: { pointsBalance: true } })
      if (!profile) throw new NotFoundException('Perfil no encontrado')
      if (profile.pointsBalance < dto.pointsAmount) {
        throw new BadRequestException('No tenés puntos suficientes para ese canje')
      }

      const redemption = await tx.pointsRedemption.create({
        data: {
          userId,
          pointsAmount: dto.pointsAmount,
          contactPhone: dto.contactPhone,
          contactNote: dto.contactNote,
        },
      })

      await tx.predictorProfile.update({
        where: { userId },
        data: { pointsBalance: { decrement: dto.pointsAmount } },
      })

      await tx.pointsLedgerEntry.create({
        data: { userId, delta: -dto.pointsAmount, reason: 'REDEMPTION_REQUEST', refId: redemption.id },
      })

      return redemption
    })
  }

  async getRoundConfig() {
    const config = await this.prisma.predictionRoundConfig.upsert({
      where: { id: ROUND_CONFIG_ID },
      create: { id: ROUND_CONFIG_ID },
      update: {},
    })
    return config
  }

  // ─────────────────────────────── Admin ───────────────────────────────

  async listRedemptions(dto: ListRedemptionsDto): Promise<CursorPage<any>> {
    const take = clampPageSize(dto.take)
    const rows = await this.prisma.pointsRedemption.findMany({
      where: dto.status ? { status: dto.status } : undefined,
      select: {
        id: true,
        userId: true,
        pointsAmount: true,
        contactPhone: true,
        contactNote: true,
        status: true,
        requestedAt: true,
        resolvedAt: true,
        user: { select: { displayName: true, email: true } },
      },
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(dto.cursor && { skip: 1, cursor: { id: dto.cursor } }),
    })
    return buildCursorPage(rows, take)
  }

  async resolveRedemption(id: string, dto: ResolveRedemptionDto) {
    return this.prisma.$transaction(async (tx) => {
      const redemption = await tx.pointsRedemption.findUnique({ where: { id } })
      if (!redemption) throw new NotFoundException('Solicitud de canje no encontrada')
      if (redemption.status === 'PAID' || redemption.status === 'REJECTED') {
        throw new BadRequestException('Esta solicitud ya está cerrada')
      }

      if (dto.status === 'REJECTED') {
        await tx.predictorProfile.update({
          where: { userId: redemption.userId },
          data: { pointsBalance: { increment: redemption.pointsAmount } },
        })
        await tx.pointsLedgerEntry.create({
          data: {
            userId: redemption.userId,
            delta: redemption.pointsAmount,
            reason: 'REDEMPTION_REJECTED',
            refId: redemption.id,
          },
        })
      }

      return tx.pointsRedemption.update({
        where: { id },
        data: { status: dto.status, resolvedAt: new Date() },
      })
    })
  }

  async setRoundConfig(dto: SetRoundConfigDto) {
    const data = {
      ...(dto.roundLabel && { roundLabel: dto.roundLabel }),
      ...(dto.targetPoints !== undefined && { targetPoints: dto.targetPoints }),
      ...(dto.currency && { currency: dto.currency }),
      ...(dto.pointsPerCurrencyUnit !== undefined && { pointsPerCurrencyUnit: dto.pointsPerCurrencyUnit }),
    }
    return this.prisma.predictionRoundConfig.upsert({
      where: { id: ROUND_CONFIG_ID },
      create: { id: ROUND_CONFIG_ID, ...data },
      update: data,
    })
  }

  // Corrección manual del saldo de un usuario (bonus, ajuste por soporte,
  // corrección de error) — siempre deja rastro en el ledger, nunca se toca
  // pointsBalance directo desde otro lado que no sea este método o settle().
  async adjustUserPoints(userId: string, dto: AdjustPointsDto) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.predictorProfile.findUnique({ where: { userId }, select: { pointsBalance: true } })
      if (!profile) throw new NotFoundException('Perfil no encontrado')
      if (profile.pointsBalance + dto.delta < 0) {
        throw new BadRequestException('El ajuste dejaría el saldo en negativo')
      }

      await tx.pointsLedgerEntry.create({
        data: { userId, delta: dto.delta, reason: 'ADMIN_ADJUSTMENT', refId: dto.note },
      })

      return tx.predictorProfile.update({
        where: { userId },
        data: { pointsBalance: { increment: dto.delta } },
        select: { userId: true, pointsBalance: true },
      })
    })
  }
}
