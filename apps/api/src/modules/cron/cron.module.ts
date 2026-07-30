import { Module } from '@nestjs/common'
import { AdminModule } from '../admin/admin.module'
import { CronController } from './cron.controller'
import { SportsSyncService } from './sports-sync.service'
import { SettlementService } from './settlement.service'

@Module({
  imports: [AdminModule],
  controllers: [CronController],
  providers: [SportsSyncService, SettlementService],
})
export class CronModule {}
