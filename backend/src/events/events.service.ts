import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type EventInput = {
  title?: unknown;
  description?: unknown;
  date?: unknown;
  time?: unknown;
  venue?: unknown;
  category?: unknown;
  imageUrl?: unknown;
  registrationUrl?: unknown;
  collegeId?: unknown;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search?: string, category?: string) {
    const events = this.prisma.event as typeof this.prisma.event & {
      findMany: (args?: Record<string, unknown>) => Promise<Record<string, any>[]>;
    };
    const where: Record<string, unknown> = { date: { gte: new Date() } };
    if (category && category !== 'All') where.category = { equals: category, mode: 'insensitive' };
    if (search?.trim()) {
      where.OR = ['title', 'description', 'venue', 'category'].map((field) => ({
        [field]: { contains: search.trim(), mode: 'insensitive' },
      }));
    }
    const rows = await events.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { college: { select: { name: true } }, _count: { select: { attendees: true } } },
    });
    return rows.map((event) => ({
      ...event,
      interestedCount: event._count?.attendees ?? 0,
    }));
  }

  async getById(id: string) {
    const events = this.prisma.event as typeof this.prisma.event & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
    };
    const event = await events.findUnique({
      where: { id },
      include: { college: { select: { name: true } }, attendees: { select: { id: true, name: true } }, groups: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async recordView(id: string) {
    const events = this.prisma.event as typeof this.prisma.event & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
    };
    if (!await events.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException('Event not found');
    const views = this.prisma.eventView as typeof this.prisma.eventView & {
      create: (args: Record<string, unknown>) => Promise<unknown>;
    };
    await views.create({ data: { eventId: id } });
    return { status: 'ok' };
  }

  async toggleAttendance(eventId: string, userId: string) {
    const events = this.prisma.event as typeof this.prisma.event & {
      findUnique: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
      update: (args: Record<string, unknown>) => Promise<Record<string, any>>;
    };
    const event = await events.findUnique({ where: { id: eventId }, include: { attendees: { select: { id: true } } } });
    if (!event) throw new NotFoundException('Event not found');
    const isAttending = (event.attendees ?? []).some((attendee: { id: string }) => attendee.id === userId);
    return events.update({
      where: { id: eventId },
      data: { attendees: { [isAttending ? 'disconnect' : 'connect']: { id: userId } } },
      include: { _count: { select: { attendees: true } } },
    });
  }

  async create(input: EventInput) {
    const data = this.validateInput(input);
    const events = this.prisma.event as typeof this.prisma.event & {
      create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
    return events.create({ data });
  }

  async update(id: string, input: EventInput) {
    const data = this.validateInput(input, true);
    const events = this.prisma.event as typeof this.prisma.event & {
      update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
    try {
      return await events.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Event not found');
    }
  }

  private validateInput(input: EventInput, partial = false) {
    const fields = ['title', 'description', 'date', 'time', 'venue', 'category'] as const;
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      const value = input[field];
      if (value === undefined && partial) continue;
      if (typeof value !== 'string' || !value.trim()) throw new BadRequestException(`${field} is required`);
      data[field] = value.trim();
    }
    if (data.date) {
      const date = new Date(String(data.date));
      if (Number.isNaN(date.getTime())) throw new BadRequestException('date must be a valid date');
      data.date = date;
    }
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.registrationUrl !== undefined) {
      if (input.registrationUrl === null || input.registrationUrl === '') data.registrationUrl = null;
      else if (typeof input.registrationUrl !== 'string') throw new BadRequestException('registrationUrl must be a valid HTTPS URL');
      else {
        let url: URL;
        try { url = new URL(input.registrationUrl); }
        catch { throw new BadRequestException('registrationUrl must be a valid HTTPS URL'); }
        if (url.protocol !== 'https:') throw new BadRequestException('registrationUrl must use HTTPS');
        data.registrationUrl = url.toString();
      }
    }
    if (input.collegeId !== undefined) data.collegeId = input.collegeId || null;
    return data;
  }
}