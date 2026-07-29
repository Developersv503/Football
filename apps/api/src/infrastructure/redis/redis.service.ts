import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'
import { getEnv } from '../../config/env'

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis

  constructor() {
    this.client = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    })
  }

  /** Incrementa `key` y le pone TTL solo en el primer incremento (ventana fija). */
  async incrWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.client.incr(key)
    if (count === 1) await this.client.expire(key, ttlSeconds)
    return count
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit()
  }
}
