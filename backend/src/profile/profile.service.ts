import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
    };
    const user = await users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, bio: true, interests: true, college: { select: { name: true } }, _count: { select: { attendingEvents: true, groupMemberships: true } } },
    });
    if (!user) throw new NotFoundException('Profile not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      collegeId: user.collegeId,
      college: user.college?.name ?? 'College not set',
      interests: user.interests,
      about: user.bio ?? '',
      stats: {
        college: user.college?.name ?? 'College not set',
        tracked: user.interests.length,
        groups: user._count?.groupMemberships ?? 0,
        events: user._count?.attendingEvents ?? 0,
      },
    };
  }

  async update(userId: string, input: { name?: unknown; bio?: unknown; interests?: unknown; collegeId?: unknown }) {
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 100) {
        throw new BadRequestException('Name must contain 2 to 100 characters');
      }
      data.name = input.name.trim();
    }
    if (input.bio !== undefined) {
      if (typeof input.bio !== 'string' || input.bio.length > 2000) throw new BadRequestException('About must be 2000 characters or fewer');
      data.bio = input.bio.trim();
    }
    if (input.interests !== undefined) {
      if (!Array.isArray(input.interests) || input.interests.length > 30 || input.interests.some((interest) => typeof interest !== 'string' || interest.trim().length > 60)) {
        throw new BadRequestException('Interests must be a list of up to 30 short text values');
      }
      data.interests = [...new Set((input.interests as string[]).map((interest) => interest.trim()).filter(Boolean))];
    }
    if (input.collegeId !== undefined) {
      if (input.collegeId !== null && typeof input.collegeId !== 'string') throw new BadRequestException('collegeId must be a college identifier');
      if (typeof input.collegeId === 'string' && input.collegeId) {
        const college = await this.prisma.college.findUnique?.({ where: { id: input.collegeId } });
        if (!college) throw new BadRequestException('Selected college was not found');
        data.collegeId = input.collegeId;
      } else {
        data.collegeId = null;
      }
    }
    if (!Object.keys(data).length) throw new BadRequestException('Provide at least one profile field');
    const users = this.prisma.user as typeof this.prisma.user & {
      update: (args: Record<string, unknown>) => Promise<unknown>;
    };
    try {
      await users.update({ where: { id: userId }, data });
    } catch {
      throw new NotFoundException('Profile not found');
    }
    return this.get(userId);
  }
}