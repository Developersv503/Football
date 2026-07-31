import { Controller, Get, UseGuards } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CronSecretGuard } from './cron-secret.guard'
import { SportsSyncService } from './sports-sync.service'
import { SettlementService } from './settlement.service'
import { MatchContestsService } from '../match-contests/match-contests.service'

@Public()
@UseGuards(CronSecretGuard)
@Controller('internal/cron')
export class CronController {
  constructor(
    private readonly sportsSync: SportsSyncService,
    private readonly settlement: SettlementService,
    private readonly matchContests: MatchContestsService,
  ) {}

  @Get('tick')
  async tick() {
    const sync = await this.sportsSync.syncToday()
    const settle = await this.settlement.settlePredictions()
    const tournaments = await this.settlement.autoTransitionTournaments()
    const matchContests = await this.matchContests.settleAllDue()
    return { sync, settle, tournaments, matchContests, ts: new Date().toISOString() }
  }
}
