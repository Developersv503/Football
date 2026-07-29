import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { getEnv } from '../../config/env'
import type { AuthUser } from '../../modules/auth/auth.types'

/** Global (ver app.module). `@Public()` en el handler o clase lo salta. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (isPublic) return true

    const request = ctx.switchToHttp().getRequest()
    if (request.method === 'OPTIONS') return true

    const authHeader: string | undefined = request.headers?.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) throw new UnauthorizedException('No autenticado')

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: getEnv().JWT_ACCESS_SECRET,
      })
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }
  }
}
