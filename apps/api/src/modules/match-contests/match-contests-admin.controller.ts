import { Body, Controller, Param, Post, Put, UsePipes } from '@nestjs/common'
import { AdminOnly } from '../../common/decorators/admin-only.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { MatchContestsService } from './match-contests.service'
import {
  setRecommendedScoreSchema,
  setRewardTiersSchema,
  type SetRecommendedScoreDto,
  type SetRewardTiersDto,
} from './match-contests.dto'

// Panel admin: el dueño elige por partido si tiene concurso de marcador
// exacto, fija el pronóstico recomendado (informativo) y los tramos de
// puntos por puesto.
@AdminOnly()
@Controller('admin/match-contests')
export class MatchContestsAdminController {
  constructor(private readonly matchContestsService: MatchContestsService) {}

  @Post(':eventId')
  ensure(@Param('eventId') eventId: string) {
    return this.matchContestsService.ensureContest(eventId)
  }

  @Post(':eventId/recommended')
  @UsePipes(new ZodValidationPipe(setRecommendedScoreSchema))
  setRecommended(@Param('eventId') eventId: string, @Body() dto: SetRecommendedScoreDto) {
    return this.matchContestsService.setRecommendedScore(eventId, dto)
  }

  @Put(':eventId/reward-tiers')
  @UsePipes(new ZodValidationPipe(setRewardTiersSchema))
  setRewardTiers(@Param('eventId') eventId: string, @Body() dto: SetRewardTiersDto) {
    return this.matchContestsService.setRewardTiers(eventId, dto)
  }

  @Post(':eventId/settle')
  settle(@Param('eventId') eventId: string) {
    return this.matchContestsService.settleOne(eventId)
  }
}
