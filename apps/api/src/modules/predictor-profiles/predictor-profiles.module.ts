import { Module } from '@nestjs/common'
import { PredictorProfilesService } from './predictor-profiles.service'
import { PredictorProfilesController } from './predictor-profiles.controller'

@Module({
  controllers: [PredictorProfilesController],
  providers: [PredictorProfilesService],
})
export class PredictorProfilesModule {}
