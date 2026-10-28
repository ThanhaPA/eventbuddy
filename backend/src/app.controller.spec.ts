import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findMany: async () => [
                {
                  id: 'evt-1',
                  title: 'TechFest 2026',
                  category: 'Technology',
                  college: { name: 'ABC College' },
                },
              ],
            },
            $queryRaw: async () => [{ '1': 1 }],
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  describe('root', () => {
    it('should return a health payload', async () => {
      const health = await appController.getHealth();

      expect(health).toMatchObject({
        status: 'ok',
        service: 'eventbuddy-backend',
      });
      expect(prismaService).toBeDefined();
    });

    it('should return a health payload from the health route', async () => {
      const health = await appController.getHealth();
      expect(health.status).toBe('ok');
    });
  });
});
