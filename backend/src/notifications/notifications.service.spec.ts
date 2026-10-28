import { NotificationsService } from './notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('NotificationsService', () => {
  it('filters notifications by the current user', async () => {
    const findMany = vi.fn(async () => []);
    const service = new NotificationsService({ notification: { findMany } } as unknown as PrismaService);
    await service.list('user-1');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' } }));
  });

  it('marks only the current user notifications as read', async () => {
    const updateMany = vi.fn(async () => ({ count: 2 }));
    const service = new NotificationsService({ notification: { updateMany } } as unknown as PrismaService);
    await service.markAllRead('user-1');
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
      data: { isRead: true },
    });
  });
});