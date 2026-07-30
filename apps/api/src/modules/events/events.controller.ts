import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { EventsService } from './events.service'
import { MatchDetailService } from './match-detail.service'
import { listEventsSchema, type ListEventsDto } from './events.dto'

// Todo el módulo es de solo lectura y público — el listado de partidos
// no requiere cuenta, igual que en stavka.tv.
@Public()
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly matchDetailService: MatchDetailService,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(listEventsSchema))
  list(@Query() query: ListEventsDto) {
    return this.eventsService.list(query)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.eventsService.getById(id)
  }

  @Get(':id/detail')
  getDetail(@Param('id') id: string) {
    return this.matchDetailService.getDetail(id)
  }
}
