import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let mongod: MongoMemoryServer;
  let createdUserId: string;

  jest.setTimeout(30000); // allow slow startup in CI

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.TEST_DB_URI = uri;

    token = jwt.sign(
      { email: 'test@example.com' },
      process.env.NEXTAUTH_SECRET || 'secret',
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const connection = app.get(getConnectionToken());
    await connection.close();
    await mongod.stop();
    await app.close();
  });

  it('POST /users - should create a user (auth required)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'new@example.com', fullName: 'John Doe' })
      .expect(201);

    expect(res.body.email).toBe('new@example.com');
    createdUserId = res.body._id;
  });

  it('POST /users - should fail without token', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'fail@example.com', fullName: 'No Auth' })
      .expect(401);
  });

  it('GET /users - should return all users (auth required)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /users/:id - should return one user', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body._id).toBe(createdUserId);
  });

  it('PATCH /users/:id - should update user', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Updated Name' })
      .expect(200);

    expect(res.body.fullName).toBe('Updated Name');
  });

  it('DELETE /users/:id - should remove user', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
