import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
      findMany: (args: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    const current = await users.findUnique({ where: { id: userId }, select: { interests: true, collegeId: true } });
    if (!current) throw new NotFoundException('User not found');
    const candidates = await users.findMany({
      where: { id: { not: userId }, role: 'student', isActive: true },
      select: { id: true, name: true, role: true, collegeId: true, interests: true },
      take: 100,
    });
    const connections = this.prisma.connection as typeof this.prisma.connection & {
      findMany: (args: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    const existing = await connections.findMany({ where: { OR: [{ requesterId: userId }, { receiverId: userId }] } });
    const byUser = new Map<string, string>();
    for (const connection of existing) {
      const otherUserId = connection.requesterId === userId ? connection.receiverId : connection.requesterId;
      byUser.set(otherUserId, connection.status);
    }
    return candidates
      .map((candidate) => {
        const common = candidate.interests.filter((interest: string) => current.interests.includes(interest));
        const sameCollege = Boolean(current.collegeId && current.collegeId === candidate.collegeId);
        const score = Math.min(100, Math.round((common.length / Math.max(1, new Set([...current.interests, ...candidate.interests]).size)) * 100 + (sameCollege ? 20 : 0)));
        return {
          id: candidate.id,
          name: candidate.name,
          department: candidate.role === 'student' ? 'Student' : candidate.role,
          year: '',
          score,
          common,
          connectionStatus: byUser.get(candidate.id) ?? null,
        };
      })
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
  }

  async connect(requesterId: string, receiverId: string) {
    if (requesterId === receiverId) throw new ConflictException('You cannot connect with yourself');
    const connections = this.prisma.connection as typeof this.prisma.connection & {
      findMany: (args: Record<string, unknown>) => Promise<Record<string, any>[]>;
      create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
    const existing = await connections.findMany({
      where: { OR: [{ requesterId, receiverId }, { requesterId: receiverId, receiverId: requesterId }] },
    });
    if (existing.length) throw new ConflictException('A connection request already exists');
    try {
      return await connections.create({ data: { requesterId, receiverId } });
    } catch {
      throw new ConflictException('A connection request already exists');
    }
  }

  async incoming(userId: string) {
    const connections = this.prisma.connection as typeof this.prisma.connection & {
      findMany: (args: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    return connections.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: { requester: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(userId: string, requestId: string, decision: 'accepted' | 'declined') {
    const connections = this.prisma.connection as typeof this.prisma.connection & {
      updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    };
    const result = await connections.updateMany({
      where: { id: requestId, receiverId: userId, status: 'pending' },
      data: { status: decision },
    });
    if (!result.count) throw new NotFoundException('Pending connection request not found');
    return { status: decision };
  }
}