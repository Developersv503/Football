import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { getEnv } from '../../config/env'

/**
 * No usa JWT — este endpoint lo llama el cron de Vercel, no un usuario.
 * Vercel Cron manda automáticamente `Authorization: Bearer $CRON_SECRET`
 * cuando la env var CRON_SECRET está configurada en el proyecto.
 */
@Injectable()
export class CronSecretGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const secret = getEnv().CRON_SECRET
    if (!secret) throw new UnauthorizedException('CRON_SECRET no configurado')

    const request = ctx.switchToHttp().getRequest()
    const authHeader: string | undefined = request.headers?.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    if (token !== secret) throw new UnauthorizedException('Secret de cron inválido')
    return true
  }
}
