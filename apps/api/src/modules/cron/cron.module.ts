import { Module } from '@nestjs/common'
import { AdminModule } from '../admin/admin.module'
import { MatchContestsModule } from '../match-contests/match-contests.module'
import { CronController } from './cron.controller'
import { SportsSyncService } from './sports-sync.service'
import { SettlementService } from './settlement.service'

@Module({
  imports: [AdminModule, MatchContestsModule],
  controllers: [CronController],
  providers: [SportsSyncService, SettlementService],
})
export class CronModule {}
