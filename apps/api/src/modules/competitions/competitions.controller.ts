import { Controller, Get, Query } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { CompetitionsService } from './competitions.service'

// Solo lectura y público, igual que el listado de partidos.
@Public()
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  list(@Query('sportKey') sportKey?: string) {
    return this.competitionsService.list(sportKey)
  }
}
