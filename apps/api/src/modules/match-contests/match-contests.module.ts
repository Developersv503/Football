import { Module } from '@nestjs/common'
import { MatchContestsService } from './match-contests.service'
import { MatchContestsController } from './match-contests.controller'
import { MatchContestsAdminController } from './match-contests-admin.controller'

@Module({
  controllers: [MatchContestsController, MatchContestsAdminController],
  providers: [MatchContestsService],
  exports: [MatchContestsService],
})
export class MatchContestsModule {}
