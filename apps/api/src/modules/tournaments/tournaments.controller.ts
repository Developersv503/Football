import { Controller, Get, Param, Post, Query, UsePipes } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { TournamentsService } from './tournaments.service'
import {
  listTournamentsSchema,
  leaderboardSchema,
  type ListTournamentsDto,
  type LeaderboardDto,
} from './tournaments.dto'

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(listTournamentsSchema))
  list(@Query() query: ListTournamentsDto) {
    return this.tournamentsService.list(query)
  }

  @Public()
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.tournamentsService.getById(id)
  }

  @Public()
  @Get(':id/leaderboard')
  @UsePipes(new ZodValidationPipe(leaderboardSchema))
  leaderboard(@Param('id') id: string, @Query() query: LeaderboardDto) {
    return this.tournamentsService.leaderboard(id, query)
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.tournamentsService.join(id, userId)
  }
}
