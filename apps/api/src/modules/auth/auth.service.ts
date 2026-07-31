import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'
import type { RegisterDto, LoginDto } from './auth.dto'
import type { AuthUser } from './auth.types'

const BCRYPT_ROUNDS = 12

@Injectable()
export class AuthService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } })
    if (exists) throw new ConflictException('Email ya registrado')

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
        profile: { create: {} }, // PredictorProfile en ceros desde el día uno
      },
      select: { id: true, email: true, role: true },
    })

    return { accessToken: await this.signToken(user) }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, role: true, passwordHash: true, isActive: true },
    })
    if (!user) throw new UnauthorizedException('Credenciales inválidas')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Credenciales inválidas')
    if (!user.isActive) throw new UnauthorizedException('Cuenta suspendida')

    return { accessToken: await this.signToken(user) }
  }

  private signToken(user: { id: string; email: string; role: 'USER' | 'ADMIN' }): Promise<string> {
    const payload: AuthUser = { sub: user.id, email: user.email, role: user.role }
    return this.jwt.signAsync(payload)
  }
}
