import { Controller, Get, Param, Post, Query, UsePipes } from '@nestjs/common'
import { AdminOnly } from '../../common/decorators/admin-only.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { AdminService } from './admin.service'
import { listUsersSchema, listAuditLogsSchema, type ListUsersDto, type ListAuditLogsDto } from './admin.dto'

// Todo el controller requiere rol ADMIN (JwtAuthGuard ya exige login;
// AdminGuard bloquea si el token no tiene role=ADMIN). Base del panel
// administrativo — el frontend del panel se decide aparte.
@AdminOnly()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @UsePipes(new ZodValidationPipe(listUsersSchema))
  listUsers(@Query() query: ListUsersDto) {
    return this.adminService.listUsers(query)
  }

  @Get('audit-logs')
  @UsePipes(new ZodValidationPipe(listAuditLogsSchema))
  listAuditLogs(@Query() query: ListAuditLogsDto) {
    return this.adminService.listAuditLogs(query)
  }

  @Post('tournaments/:id/settle')
  settleTournament(@Param('id') id: string) {
    return this.adminService.settleTournament(id)
  }
}
