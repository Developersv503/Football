import { Controller, Get, UseGuards } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CronSecretGuard } from './cron-secret.guard'
import { SportsSyncService } from './sports-sync.service'
import { SettlementService } from './settlement.service'

@Public()
@UseGuards(CronSecretGuard)
@Controller('internal/cron')
export class CronController {
  constructor(
    private readonly sportsSync: SportsSyncService,
    private readonly settlement: SettlementService,
  ) {}

  @Get('tick')
  async tick() {
    const sync = await this.sportsSync.syncToday()
    const settle = await this.settlement.settlePredictions()
    const tournaments = await this.settlement.autoTransitionTournaments()
    return { sync, settle, tournaments, ts: new Date().toISOString() }
  }
}
