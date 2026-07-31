import { Body, Controller, Param, Patch, UsePipes } from '@nestjs/common'
import { AdminOnly } from '../../common/decorators/admin-only.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { EventsService } from './events.service'
import { adminUpdateEventSchema, type AdminUpdateEventDto } from './events.dto'

@AdminOnly()
@Controller('admin/events')
export class EventsAdminController {
  constructor(private readonly eventsService: EventsService) {}

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(adminUpdateEventSchema))
  update(@Param('id') id: string, @Body() dto: AdminUpdateEventDto) {
    return this.eventsService.adminUpdate(id, dto)
  }
}
