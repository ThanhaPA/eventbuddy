import { BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AdminService', () => {
  it('prevents suspending an admin account', async () => {
    const update = vi.fn();
    const service = new AdminService({
      user: { findUnique: async () => ({ role: 'admin' }), update },
    } as unknown as PrismaService);
    await expect(service.setUserActive('admin-1', false)).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });
});