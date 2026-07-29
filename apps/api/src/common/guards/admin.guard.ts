import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator'
import type { AuthUser } from '../../modules/auth/auth.types'

/** Se aplica junto a JwtAuthGuard (ya corrió y llenó req.user). Solo bloquea si `@AdminOnly()`. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_ONLY_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!isAdminOnly) return true

    const user: AuthUser | undefined = ctx.switchToHttp().getRequest().user
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Requiere rol admin')
    return true
  }
}
