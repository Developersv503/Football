import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import helmet from '@fastify/helmet'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AppModule } from './app.module'
import { getEnv, isProd } from './config/env'

/**
 * Setup compartido entre el entrypoint local/GCP (`main.ts`, un solo proceso
 * long-lived) y el entrypoint serverless de Vercel (`api/index.ts`, que
 * cachea esta misma instancia entre invocaciones tibias de Fluid Compute).
 */
export async function createApp(): Promise<NestFastifyApplication> {
  const env = getEnv()

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
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

  return app
}
