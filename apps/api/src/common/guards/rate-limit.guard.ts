import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { RedisService } from '../../infrastructure/redis/redis.service'

export const RATE_LIMIT_KEY = 'rate_limit'

export interface RateLimitOptions {
  limit: number
  windowMs: number
  keyPrefix?: string
}

/** Límite global por defecto para toda petición sin @RateLimit propio. 600/min por IP. */
const DEFAULT_GLOBAL_LIMIT: RateLimitOptions = { limit: 600, windowMs: 60_000, keyPrefix: 'global' }

/** @RateLimit({ limit: 5, windowMs: 60_000 }) sobre un handler puntual (ej. crear pronóstico). */
export function RateLimit(options: RateLimitOptions) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value)
    return descriptor
  }
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler()
    const explicit = Reflect.getMetadata(RATE_LIMIT_KEY, handler) as RateLimitOptions | undefined
    const options = explicit ?? DEFAULT_GLOBAL_LIMIT

    const req = context.switchToHttp().getRequest()
    // req.ip viene del proxy de confianza (trustProxy en main.ts) — no spoofeable.
    const ip = req?.ip ?? req?.socket?.remoteAddress ?? 'unknown'
    const prefix = options.keyPrefix ?? handler.name
    const key = `ratelimit:${prefix}:${ip}`

    let count: number
    try {
      count = await this.redis.incrWithTtl(key, Math.ceil(options.windowMs / 1000))
    } catch {
      return true // Redis caído: fail-open, no tumbar la API por eso.
    }

    if (count > options.limit) {
      throw new HttpException('Demasiadas solicitudes. Intente de nuevo más tarde.', HttpStatus.TOO_MANY_REQUESTS)
    }
    return true
  }
}
