import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('EventsService', () => {
  const event = { id: 'event-1', title: 'Campus Hackathon', attendees: [] as { id: string }[] };
  const delegates = {
    findMany: vi.fn(async () => [event]),
    findUnique: vi.fn(async () => event),
    create: vi.fn(async ({ data }: { data: unknown }) => data),
    update: vi.fn(async ({ data }: { data: unknown }) => data),
  };
  const service = new EventsService({ event: delegates } as unknown as PrismaService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies search and category filters to upcoming events', async () => {
    await service.list('hackathon', 'Technology');
    expect(delegates.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        category: { equals: 'Technology', mode: 'insensitive' },
        OR: expect.arrayContaining([expect.objectContaining({ title: { contains: 'hackathon', mode: 'insensitive' } })]),
      }),
    }));
  });

  it('toggles attendance for the current user', async () => {
    await service.toggleAttendance('event-1', 'user-1');
    expect(delegates.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'event-1' },
      data: { attendees: { connect: { id: 'user-1' } } },
    }));
  });

  it('updates the displayed interested count from the attendee relation count', async () => {
    delegates.findMany.mockResolvedValueOnce([{ ...event, interestedCount: 99, _count: { attendees: 3 } }] as never);
    const rows = await service.list();
    expect(rows[0].interestedCount).toBe(3);
  });

  it('rejects attendance changes for unknown events', async () => {
    delegates.findUnique.mockResolvedValueOnce(null as never);
    await expect(service.toggleAttendance('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});