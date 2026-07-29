import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { RateLimit } from '../../common/guards/rate-limit.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'
import { registerSchema, loginSchema, type RegisterDto, type LoginDto } from './auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @RateLimit({ limit: 10, windowMs: 60_000, keyPrefix: 'auth:register' })
  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  // Límite bajo: login es el blanco típico de fuerza bruta.
  @RateLimit({ limit: 10, windowMs: 60_000, keyPrefix: 'auth:login' })
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }
}
