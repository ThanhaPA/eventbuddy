import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const notifications = this.prisma.notification as typeof this.prisma.notification & {
      findMany: (args?: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    return notifications.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async markAllRead(userId: string) {
    const notifications = this.prisma.notification as typeof this.prisma.notification & {
      updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    };
    const result = await notifications.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { updated: result.count };
  }

  async markRead(userId: string, id: string) {
    const notifications = this.prisma.notification as typeof this.prisma.notification & {
      updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    };
    const result = await notifications.updateMany({ where: { id, userId }, data: { isRead: true } });
    if (!result.count) throw new NotFoundException('Notification not found');
    return { status: 'ok' };
  }
}