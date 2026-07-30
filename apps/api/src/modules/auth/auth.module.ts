import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { getEnv } from '../../config/env'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getEnv().JWT_ACCESS_SECRET,
        // @nestjs/jwt 11 tipa expiresIn como el literal `StringValue` de `ms`;
        // la env var ya está validada en runtime por Zod, solo falta el cast.
        signOptions: { expiresIn: getEnv().JWT_ACCESS_EXPIRES as `${number}${'s' | 'm' | 'h' | 'd'}` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
