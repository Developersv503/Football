import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { PredictorProfilesService } from './predictor-profiles.service'
import { globalRankingSchema, type GlobalRankingDto } from './predictor-profiles.dto'

@Controller('predictor-profiles')
export class PredictorProfilesController {
  constructor(private readonly profilesService: PredictorProfilesService) {}

  @Get('me')
  getMine(@CurrentUser('sub') userId: string) {
    return this.profilesService.getByUserId(userId)
  }

  @Public()
  @Get('ranking')
  @UsePipes(new ZodValidationPipe(globalRankingSchema))
  globalRanking(@Query() query: GlobalRankingDto) {
    return this.profilesService.globalRanking(query)
  }

  @Public()
  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.profilesService.getByUserId(userId)
  }
}
