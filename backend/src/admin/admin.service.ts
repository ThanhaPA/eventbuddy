import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [students, colleges, events, groups, views] = await Promise.all([
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.college.count(),
      this.prisma.event.count(),
      this.prisma.eventGroup.count(),
      this.prisma.eventView.count(),
    ]);
    return {
      stats: [
        { value: String(students), label: 'Students' },
        { value: String(colleges), label: 'Colleges' },
        { value: String(events), label: 'Events' },
        { value: String(groups), label: 'Groups' },
        { value: String(views), label: 'Event detail views' },
      ],
    };
  }

  async listEvents() {
    const events = this.prisma.event as typeof this.prisma.event & { findMany: (args?: Record<string, unknown>) => Promise<Record<string, unknown>[]> };
    return events.findMany({ include: { college: { select: { name: true } }, _count: { select: { attendees: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async listColleges() {
    return this.prisma.college.findMany({ orderBy: { name: 'asc' } });
  }

  async listUsers() {
    const users = this.prisma.user as typeof this.prisma.user & { findMany: (args?: Record<string, unknown>) => Promise<Record<string, unknown>[]> };
    return users.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, college: { select: { name: true } }, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async setUserActive(id: string, isActive: unknown) {
    if (typeof isActive !== 'boolean') throw new BadRequestException('isActive must be true or false');
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<{ role: string } | null>;
      update: (args: Record<string, unknown>) => Promise<unknown>;
    };
    const target = await users.findUnique({ where: { id }, select: { role: true } });
    if (!target) throw new NotFoundException('User not found');
    if (target.role === 'admin' && !isActive) throw new BadRequestException('Admin accounts cannot be suspended here');
    try { return await users.update({ where: { id }, data: { isActive }, select: { id: true, email: true, name: true, isActive: true } }); }
    catch { throw new NotFoundException('User not found'); }
  }

  async createCollege(input: Record<string, unknown>) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const city = typeof input.city === 'string' ? input.city.trim() : '';
    if (!name || !city) throw new BadRequestException('College name and city are required');
    const colleges = this.prisma.college as typeof this.prisma.college & { create: (args: Record<string, unknown>) => Promise<unknown> };
    return colleges.create({ data: {
      name,
      city,
      state: typeof input.state === 'string' ? input.state.trim() || null : null,
      country: typeof input.country === 'string' && input.country.trim() ? input.country.trim() : 'India',
      description: typeof input.description === 'string' ? input.description.trim() || null : null,
      website: typeof input.website === 'string' ? input.website.trim() || null : null,
    } });
  }

  async updateCollege(id: string, input: Record<string, unknown>) {
    const data: Record<string, unknown> = {};
    for (const key of ['name', 'city', 'state', 'country', 'description', 'website']) {
      if (input[key] !== undefined) data[key] = typeof input[key] === 'string' ? input[key].trim() : input[key];
    }
    if (!Object.keys(data).length) throw new BadRequestException('Provide at least one college field');
    const colleges = this.prisma.college as typeof this.prisma.college & { update: (args: Record<string, unknown>) => Promise<unknown> };
    try { return await colleges.update({ where: { id }, data }); }
    catch { throw new NotFoundException('College not found'); }
  }
}