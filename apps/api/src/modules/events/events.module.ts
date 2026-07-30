import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { MatchDetailService } from './match-detail.service'
import { EventsController } from './events.controller'

@Module({
  controllers: [EventsController],
  providers: [EventsService, MatchDetailService],
  exports: [EventsService],
})
export class EventsModule {}
