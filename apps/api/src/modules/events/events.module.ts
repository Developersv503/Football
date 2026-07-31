import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { MatchDetailService } from './match-detail.service'
import { EventsController } from './events.controller'
import { EventsAdminController } from './events-admin.controller'

@Module({
  controllers: [EventsController, EventsAdminController],
  providers: [EventsService, MatchDetailService],
  exports: [EventsService],
})
export class EventsModule {}
