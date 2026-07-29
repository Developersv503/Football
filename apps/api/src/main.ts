import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import helmet from '@fastify/helmet'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AppModule } from './app.module'
import { getEnv, isProd } from './config/env'

async function bootstrap(): Promise<void> {
  const env = getEnv()

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // trustProxy: la IP real llega vía X-Forwarded-For (Vercel/Cloudflare
    // están delante) — sin esto, el rate-limit por IP le pegaría todo al
    // proxy en vez de al cliente real.
    new FastifyAdapter({ trustProxy: 1 }),
  )

  await app.register(helmet, { contentSecurityPolicy: isProd() })

  app.enableCors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.setGlobalPrefix('api')
  app.useGlobalFilters(new HttpExceptionFilter())

  const fastify = app.getHttpAdapter().getInstance()
  fastify.get('/api/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  await app.listen(env.PORT, isProd() ? '0.0.0.0' : '127.0.0.1')
  console.log(`API en puerto ${env.PORT} [${env.NODE_ENV}]`)
}

void bootstrap()
