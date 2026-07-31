import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common'
import { AdminOnly } from '../../common/decorators/admin-only.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { PointsService } from './points.service'
import {
  adjustPointsSchema,
  listRedemptionsSchema,
  resolveRedemptionSchema,
  setRoundConfigSchema,
  type AdjustPointsDto,
  type ListRedemptionsDto,
  type ResolveRedemptionDto,
  type SetRoundConfigDto,
} from './points.dto'

// Panel admin: el dueño ve las solicitudes de canje (dinero real, contacto
// manual), las marca CONTACTED/PAID/REJECTED, y edita la meta de puntos de
// la jornada actual.
@AdminOnly()
@Controller('admin/points')
export class PointsAdminController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('redemptions')
  @UsePipes(new ZodValidationPipe(listRedemptionsSchema))
  listRedemptions(@Query() query: ListRedemptionsDto) {
    return this.pointsService.listRedemptions(query)
  }

  @Patch('redemptions/:id')
  @UsePipes(new ZodValidationPipe(resolveRedemptionSchema))
  resolveRedemption(@Param('id') id: string, @Body() dto: ResolveRedemptionDto) {
    return this.pointsService.resolveRedemption(id, dto)
  }

  @Patch('round-config')
  @UsePipes(new ZodValidationPipe(setRoundConfigSchema))
  setRoundConfig(@Body() dto: SetRoundConfigDto) {
    return this.pointsService.setRoundConfig(dto)
  }

  @Patch('users/:userId/adjust')
  @UsePipes(new ZodValidationPipe(adjustPointsSchema))
  adjustUserPoints(@Param('userId') userId: string, @Body() dto: AdjustPointsDto) {
    return this.pointsService.adjustUserPoints(userId, dto)
  }
}
