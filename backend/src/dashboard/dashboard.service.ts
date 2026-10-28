import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MatchesService } from '../matches/matches.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly matchesService: MatchesService) {}

  async get(userId: string) {
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
    };
    const user = await users.findUnique({
      where: { id: userId },
      include: {
        attendingEvents: { include: { college: { select: { name: true } } }, orderBy: { date: 'asc' } },
        groupMemberships: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const [upcomingCount, matches, recommendations] = await Promise.all([
      this.prisma.event.count({ where: { date: { gte: new Date() } } }),
      this.matchesService.list(userId),
      this.prisma.event.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: 'asc' }, take: 3, include: { college: { select: { name: true } } } }),
    ]);
    return {
      stats: [
        { value: String(upcomingCount), label: 'Upcoming events' },
        { value: String(matches.length), label: 'Student matches' },
        { value: String(user.groupMemberships?.length ?? 0), label: 'Groups joined' },
      ],
      upcoming: (user.attendingEvents ?? []).map((event: Record<string, any>) => ({
        title: event.title,
        date: new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        college: event.college?.name ?? 'Campus Event',
      })),
      recommended: recommendations.map((event: Record<string, any>) => ({ id: event.id, title: event.title, college: event.college?.name ?? 'Campus Event' })),
      matches: matches.slice(0, 3),
    };
  }

  async interests(userId: string) {
    const users = this.prisma.user as typeof this.prisma.user & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
    };
    const user = await users.findUnique({
      where: { id: userId },
      include: { attendingEvents: { include: { college: { select: { name: true } } }, orderBy: { date: 'asc' } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return (user.attendingEvents ?? []).map((event: Record<string, any>) => ({
      id: event.id,
      title: event.title,
      college: event.college?.name ?? 'Campus Event',
      date: new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: event.category,
      image: event.imageUrl,
    }));
  }
}