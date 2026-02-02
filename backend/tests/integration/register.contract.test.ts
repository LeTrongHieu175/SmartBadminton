import request from 'supertest';
import express from 'express';
import jestOpenAPI from 'jest-openapi';
import path from 'path';
import authRouter from '../../src/routes/auth.routes';
import { responseMiddleware } from '../../src/shared/response';
import * as userRepo from '../../src/modules/auth/repositories/user.repository';

jest.mock('../../src/modules/auth/repositories/user.repository');

const specPath = path.join(__dirname, '../../../docs/api/auth.yaml');

beforeAll(() => {
  jestOpenAPI(specPath);
});

const appFactory = () => {
  const app = express();
  app.use(responseMiddleware);
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
};

describe('API contract for /api/auth/register', () => {
  const payload = {
    username: 'contract_user',
    password: 'Password123',
    fullName: 'Contract Test',
    phone: '0981111222',
    email: 'contract@example.com',
    role: 'CUSTOMER',
  };

  const mockRepo = userRepo as jest.Mocked<typeof userRepo>;

  beforeEach(() => {
    mockRepo.findUserByUsername.mockResolvedValue(null);
    mockRepo.findUserByPhone.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createUserWithRelations.mockResolvedValue({
      user: {
        id: 'user-id',
        username: payload.username,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        role: payload.role as any,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      refreshToken: {} as any,
    });
  });

  it('matches OpenAPI success schema', async () => {
    const res = await request(appFactory())
      .post('/api/auth/register')
      .send(payload);

    expect(res).toSatisfyApiSpec();
  });

  it('matches OpenAPI error schema', async () => {
    mockRepo.findUserByUsername.mockResolvedValue({ id: 'existing' } as any);
    const res = await request(appFactory())
      .post('/api/auth/register')
      .send(payload);

    expect(res).toSatisfyApiSpec();
  });
});
