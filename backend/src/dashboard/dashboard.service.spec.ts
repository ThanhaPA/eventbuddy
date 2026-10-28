import { DashboardService } from './dashboard.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MatchesService } from '../matches/matches.service.js';

describe('DashboardService', () => {
  it('returns attended events and counts from the current user record', async () => {
    const userFindUnique = vi.fn(async () => ({
      groupMemberships: [{ id: 'membership-1' }],
      attendingEvents: [{ title: 'Campus Day', date: new Date('2026-11-01T10:00:00Z'), college: { name: 'Example College' } }],
    }));
    const prisma = {
      user: { findUnique: userFindUnique },
      event: { count: async () => 4, findMany: async () => [] },
    } as unknown as PrismaService;
    const matches = { list: async () => [] } as unknown as MatchesService;
    const result = await new DashboardService(prisma, matches).get('user-1');
    expect(userFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-1' } }));
    expect(result.stats[2]).toMatchObject({ value: '1', label: 'Groups joined' });
    expect(result.upcoming[0]).toMatchObject({ title: 'Campus Day', college: 'Example College' });
  });
});