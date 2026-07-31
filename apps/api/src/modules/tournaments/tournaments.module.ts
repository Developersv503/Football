import { Module } from '@nestjs/common'
import { TournamentsService } from './tournaments.service'
import { TournamentsController } from './tournaments.controller'
import { TournamentsAdminController } from './tournaments-admin.controller'

@Module({
  controllers: [TournamentsController, TournamentsAdminController],
  providers: [TournamentsService],
})
export class TournamentsModule {}
