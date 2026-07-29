import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RateLimit } from '../../common/guards/rate-limit.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { PredictionsService } from './predictions.service'
import {
  createPredictionSchema,
  listMyPredictionsSchema,
  type CreatePredictionDto,
  type ListMyPredictionsDto,
} from './predictions.dto'

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @RateLimit({ limit: 30, windowMs: 60_000, keyPrefix: 'predictions:create' })
  @UsePipes(new ZodValidationPipe(createPredictionSchema))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.create(userId, dto)
  }

  @Get('me')
  @UsePipes(new ZodValidationPipe(listMyPredictionsSchema))
  listMine(@CurrentUser('sub') userId: string, @Query() query: ListMyPredictionsDto) {
    return this.predictionsService.listMine(userId, query)
  }
}
