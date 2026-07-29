import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { PrismaModule } from './infrastructure/prisma/prisma.module'
import { RedisModule } from './infrastructure/redis/redis.module'
import { AuditModule } from './common/audit/audit.module'
import { AuditInterceptor } from './common/audit/audit.interceptor'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { AdminGuard } from './common/guards/admin.guard'
import { RateLimitGuard } from './common/guards/rate-limit.guard'
import { AuthModule } from './modules/auth/auth.module'
import { EventsModule } from './modules/events/events.module'
import { PredictionsModule } from './modules/predictions/predictions.module'
import { TournamentsModule } from './modules/tournaments/tournaments.module'
import { PredictorProfilesModule } from './modules/predictor-profiles/predictor-profiles.module'
import { AdminModule } from './modules/admin/admin.module'

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuditModule,
    AuthModule,
    EventsModule,
    PredictionsModule,
    TournamentsModule,
    PredictorProfilesModule,
    AdminModule,
  ],
  providers: [
    // Orden importa: rate-limit primero (barato, corta floods antes de tocar
    // JWT/DB), después auth, después el chequeo de rol admin.
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: AdminGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
