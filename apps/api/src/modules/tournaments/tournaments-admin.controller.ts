import { Body, Controller, Param, Patch, Post, UsePipes } from '@nestjs/common'
import { AdminOnly } from '../../common/decorators/admin-only.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { TournamentsService } from './tournaments.service'
import {
  createTournamentSchema,
  updateTournamentSchema,
  type CreateTournamentDto,
  type UpdateTournamentDto,
} from './tournaments.dto'

@AdminOnly()
@Controller('admin/tournaments')
export class TournamentsAdminController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTournamentSchema))
  create(@Body() dto: CreateTournamentDto) {
    return this.tournamentsService.create(dto)
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateTournamentSchema))
  update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournamentsService.update(id, dto)
  }
}
