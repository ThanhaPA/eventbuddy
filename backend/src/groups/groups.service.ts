import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const memberships = this.prisma.groupMember as typeof this.prisma.groupMember & {
      findMany: (args?: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    const rows = await memberships.findMany({
      where: { userId },
      include: { group: { include: { event: true, members: true } } },
      orderBy: { joinedAt: 'desc' },
    });
    return rows.flatMap(({ group }) => group ? [{
      id: group.id,
      name: group.name,
      event: group.event.title,
      members: group.members.length,
      maxMembers: Math.max(group.members.length + 2, 6),
      status: 'Active',
    }] : []);
  }

  async listAvailableForUser(userId: string) {
    const groups = this.prisma.eventGroup as typeof this.prisma.eventGroup & {
      findMany: (args?: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    return groups.findMany({
      where: { members: { none: { userId } } },
      include: { event: true, members: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, name: unknown, eventId: unknown) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80 || typeof eventId !== 'string' || !eventId) {
      throw new BadRequestException('A group name and event are required');
    }
    const groups = this.prisma.eventGroup as typeof this.prisma.eventGroup & {
      create: (args: Record<string, unknown>) => Promise<{ id: string; name: string }>;
    };
    const memberships = this.prisma.groupMember as typeof this.prisma.groupMember & {
      create: (args: Record<string, unknown>) => Promise<unknown>;
    };
    const group = await groups.create({ data: { name: name.trim(), eventId } });
    await memberships.create({ data: { userId, groupId: group.id, role: 'admin' } });
    return group;
  }

  async join(userId: string, groupId: string) {
    const memberships = this.prisma.groupMember as typeof this.prisma.groupMember & {
      create: (args: Record<string, unknown>) => Promise<unknown>;
    };
    try {
      return await memberships.create({ data: { userId, groupId } });
    } catch {
      throw new ConflictException('You are already a member or the group does not exist');
    }
  }

  async leave(userId: string, groupId: string) {
    const memberships = this.prisma.groupMember as typeof this.prisma.groupMember & {
      deleteMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    };
    const result = await memberships.deleteMany({ where: { userId, groupId, role: { not: 'admin' } } });
    if (!result.count) throw new ForbiddenException('Group owner cannot leave; transfer ownership first');
    return { status: 'ok' };
  }

  async getDetails(userId: string, groupId: string) {
    const groups = this.prisma.eventGroup as typeof this.prisma.eventGroup & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
    };
    const group = await groups.findUnique({
      where: { id: groupId },
      include: {
        event: true,
        members: { include: { user: { select: { id: true, name: true } } } },
        messages: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' }, take: 100 },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    const isMember = group.members.some((member: { userId: string }) => member.userId === userId);
    if (!isMember) throw new ForbiddenException('Join the group to view its messages');
    return group;
  }

  async sendMessage(userId: string, groupId: string, input: unknown) {
    if (typeof input !== 'string' || !input.trim() || input.trim().length > 2000) {
      throw new BadRequestException('Message must contain 1 to 2000 characters');
    }
    await this.getDetails(userId, groupId);
    const messages = this.prisma.groupMessage as typeof this.prisma.groupMessage & {
      create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
    return messages.create({
      data: { userId, groupId, text: input.trim() },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}