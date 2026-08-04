import { z } from 'zod'

/**
 * Única fuente de verdad de config. `getEnv()` valida con Zod al primer
 * acceso y cachea — si falta o es inválida una variable, la API falla al
 * arrancar (fail-fast) en vez de romper en medio de un request.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  DOCS_API_KEY: z.string().min(16).optional(),

  SPORTRADAR_API_KEY: z.string().optional(),
  GOALSERVE_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(16).optional(),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function getEnv(): Env {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas:')
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
  }
  cached = parsed.data
  return cached
}

export const isProd = (): boolean => getEnv().NODE_ENV === 'production'
