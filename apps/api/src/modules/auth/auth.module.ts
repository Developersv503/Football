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
        signOptions: { expiresIn: getEnv().JWT_ACCESS_EXPIRES },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
