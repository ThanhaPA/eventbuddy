import { MatchesService } from './matches.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('MatchesService', () => {
  it('ranks users using real shared interests and college', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn(async () => ({ interests: ['AI', 'Robotics'], collegeId: 'college-1' })),
        findMany: vi.fn(async () => [
          { id: 'user-2', name: 'Sam', role: 'student', collegeId: 'college-1', interests: ['AI', 'Robotics'] },
          { id: 'user-3', name: 'Rae', role: 'student', collegeId: 'college-2', interests: ['Art'] },
        ]),
      },
      connection: { findMany: vi.fn(async () => []) },
    } as unknown as PrismaService;

    const matches = await new MatchesService(prisma).list('user-1');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ id: 'user-2', common: ['AI', 'Robotics'], score: 100 });
  });

  it('updates only the recipient-owned pending connection request', async () => {
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const service = new MatchesService({ connection: { updateMany } } as unknown as PrismaService);
    await service.respond('receiver-1', 'request-1', 'accepted');
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'request-1', receiverId: 'receiver-1', status: 'pending' },
      data: { status: 'accepted' },
    });
  });
});