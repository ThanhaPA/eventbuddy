import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
          service: 'eventbuddy-backend',
        });
      });
  });

  it('rejects unauthenticated dashboard requests', () => {
    return request(app.getHttpServer()).get('/dashboard').expect(401);
  });

  it('rejects unauthenticated admin requests', () => {
    return request(app.getHttpServer()).get('/admin/overview').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
