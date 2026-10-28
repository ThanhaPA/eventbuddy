import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service.js';

const scrypt = promisify(scryptCallback);
const tokenLifetimeSeconds = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

@Injectable()
export class AuthService {
  private readonly secret = process.env.JWT_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : randomBytes(32).toString('hex'));

  constructor(private readonly prisma: PrismaService) {
    if (!this.secret || this.secret.length < 32) {
      throw new Error('JWT_SECRET must be set to a random value of at least 32 characters');
    }
  }

  async register(input: { email?: unknown; name?: unknown; password?: unknown; collegeId?: unknown }) {
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const password = typeof input.password === 'string' ? input.password : '';

    if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 2 || name.length > 100 || password.length < 12) {
      throw new BadRequestException('Provide a valid email, a name, and a password of at least 12 characters');
    }

    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<SessionUser | null>;
      create: (args: Record<string, unknown>) => Promise<SessionUser>;
    };

    if (await users.findUnique({ where: { email } })) {
      throw new ConflictException('An account with this email already exists');
    }

    let collegeId: string | null = null;
    if (typeof input.collegeId === 'string' && input.collegeId) {
      const college = await this.prisma.college.findUnique?.({ where: { id: input.collegeId } });
      if (!college) throw new BadRequestException('Selected college was not found');
      collegeId = input.collegeId;
    }

    const passwordHash = await this.hashPassword(password);
    const user = await users.create({
      data: { email, name, passwordHash, role: 'student', interests: [], collegeId },
      select: { id: true, email: true, name: true, role: true },
    });

    return { user, token: this.createToken(user) };
  }

  async login(input: { email?: unknown; password?: unknown }) {
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<(SessionUser & { passwordHash: string | null; isActive: boolean }) | null>;
    };
    const user = await users.findUnique({ where: { email } });

    if (!user || !user.isActive || !user.passwordHash || !(await this.verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return { user: sessionUser, token: this.createToken(sessionUser) };
  }

  verifyToken(token: string): SessionUser {
    const [encodedPayload, signature, extra] = token.split('.');
    if (!encodedPayload || !signature || extra) throw new UnauthorizedException('Invalid session');

    const expected = this.sign(encodedPayload);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Invalid session');
    }

    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionUser & { exp: number };
      if (!payload.id || !payload.email || !payload.name || payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Session expired');
      }
      return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }

  async authenticate(token: string): Promise<SessionUser> {
    const tokenUser = this.verifyToken(token);
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<SessionUser & { isActive: boolean } | null>;
    };
    const user = await users.findUnique({
      where: { id: tokenUser.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Account is inactive');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16);
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [algorithm, saltHex, keyHex] = storedHash.split(':');
    if (algorithm !== 'scrypt' || !saltHex || !keyHex) return false;
    const expected = Buffer.from(keyHex, 'hex');
    const actual = (await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private createToken(user: SessionUser) {
    const payload = Buffer.from(
      JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }

  private sign(payload: string) {
    return createHmac('sha256', this.secret!).update(payload).digest('base64url');
  }
}