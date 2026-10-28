import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let storedUser: Record<string, unknown> | null;

  beforeEach(() => {
    storedUser = null;
    const prisma = {
      user: {
        findUnique: async () => storedUser,
        create: async ({ data }: { data: Record<string, unknown> }) => {
          storedUser = { id: 'user-1', ...data };
          return { id: 'user-1', email: data.email, name: data.name, role: data.role };
        },
      },
    } as unknown as PrismaService;
    authService = new AuthService(prisma);
  });

  it('registers with a password hash and verifiable session token', async () => {
    const result = await authService.register({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'a-long-test-password',
    });

    expect(result.user).toMatchObject({ id: 'user-1', email: 'student@example.com', role: 'student' });
    expect(storedUser?.passwordHash).toMatch(/^scrypt:/);
    expect(authService.verifyToken(result.token)).toMatchObject(result.user);
  });

  it('rejects duplicate registration', async () => {
    storedUser = {
      id: 'user-1',
      email: 'student@example.com',
      name: 'Existing Student',
      role: 'student',
      passwordHash: 'scrypt:salt:key',
    };

    await expect(
      authService.register({
        name: 'Test Student',
        email: 'student@example.com',
        password: 'a-long-test-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a tampered session token', async () => {
    const { token } = await authService.register({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'a-long-test-password',
    });

    expect(() => authService.verifyToken(`${token}tampered`)).toThrow(UnauthorizedException);
  });

  it('invalidates sessions after an account is suspended', async () => {
    const { token } = await authService.register({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'a-long-test-password',
    });
    storedUser = { ...storedUser, isActive: false };
    await expect(authService.authenticate(token)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});