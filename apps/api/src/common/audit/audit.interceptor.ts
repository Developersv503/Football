import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { AuditService } from './audit.service'
import type { AuthUser } from '../../modules/auth/auth.types'

const METHOD_TO_ACTION: Record<string, 'CREATE' | 'UPDATE' | 'DELETE'> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
}

/** Auto-registra CREATE/UPDATE/DELETE de toda mutación autenticada. Global (ver app.module). */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest()
    const action = METHOD_TO_ACTION[req.method?.toUpperCase() ?? '']
    if (!action) return next.handle()

    const user: AuthUser | undefined = req.user
    if (!user) return next.handle()

    const entity = ctx.getClass().name.replace('Controller', '')
    const entityId: string | undefined = req.params?.id
    const ip: string =
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ?? req.ip ?? 'unknown'

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({ userId: user.sub, action, entity, entityId, ip })
      }),
    )
  }
}
