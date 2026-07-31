import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { PointsService } from './points.service'
import {
  listLedgerSchema,
  requestRedemptionSchema,
  type ListLedgerDto,
  type RequestRedemptionDto,
} from './points.dto'

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Public()
  @Get('round-config')
  getRoundConfig() {
    return this.pointsService.getRoundConfig()
  }

  @Get('me')
  getMyBalance(@CurrentUser('sub') userId: string) {
    return this.pointsService.getMyBalance(userId)
  }

  @Get('me/ledger')
  @UsePipes(new ZodValidationPipe(listLedgerSchema))
  listMyLedger(@CurrentUser('sub') userId: string, @Query() query: ListLedgerDto) {
    return this.pointsService.listMyLedger(userId, query)
  }

  @Post('redemptions')
  @UsePipes(new ZodValidationPipe(requestRedemptionSchema))
  requestRedemption(@CurrentUser('sub') userId: string, @Body() dto: RequestRedemptionDto) {
    return this.pointsService.requestRedemption(userId, dto)
  }
}
