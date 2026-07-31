import { Body, Controller, Get, Param, Post, Query, UsePipes } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RateLimit } from '../../common/guards/rate-limit.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { MatchContestsService } from './match-contests.service'
import {
  leaderboardQuerySchema,
  submitScorePredictionSchema,
  type LeaderboardQueryDto,
  type SubmitScorePredictionDto,
} from './match-contests.dto'

@Controller('match-contests')
export class MatchContestsController {
  constructor(private readonly matchContestsService: MatchContestsService) {}

  @Public()
  @Get(':eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.matchContestsService.getByEventId(eventId)
  }

  @Public()
  @Get(':eventId/leaderboard')
  @UsePipes(new ZodValidationPipe(leaderboardQuerySchema))
  leaderboard(@Param('eventId') eventId: string, @Query() query: LeaderboardQueryDto) {
    return this.matchContestsService.leaderboard(eventId, query)
  }

  @Get(':eventId/me')
  myPrediction(@Param('eventId') eventId: string, @CurrentUser('sub') userId: string) {
    return this.matchContestsService.myPrediction(eventId, userId)
  }

  @Post(':eventId/predict')
  @RateLimit({ limit: 20, windowMs: 60_000, keyPrefix: 'match-contests:predict' })
  @UsePipes(new ZodValidationPipe(submitScorePredictionSchema))
  predict(
    @Param('eventId') eventId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: SubmitScorePredictionDto,
  ) {
    return this.matchContestsService.predict(eventId, userId, dto)
  }
}
