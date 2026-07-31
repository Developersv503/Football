import { Module } from '@nestjs/common'
import { PointsService } from './points.service'
import { PointsController } from './points.controller'
import { PointsAdminController } from './points-admin.controller'

@Module({
  controllers: [PointsController, PointsAdminController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
