import request from 'supertest';
import express from 'express';
import authRouter from '../../src/routes/auth.routes';
import { responseMiddleware } from '../../src/shared/response';
import { resetRateLimit } from '../../src/middleware/rateLimit';
import * as userRepo from '../../src/modules/auth/repositories/user.repository';
import * as hashUtils from '../../src/shared/hash';
import * as jwtUtils from '../../src/shared/jwt';

jest.mock('../../src/modules/auth/repositories/user.repository');
jest.mock('../../src/shared/hash', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed'),
}));
jest.mock('../../src/shared/jwt', () => ({
  signAccessToken: jest.fn().mockResolvedValue('access-token'),
  signRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
}));

const mockRepo = userRepo as jest.Mocked<typeof userRepo>;

const buildApp = () => {
  const app = express();
  app.use(responseMiddleware);
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
};

describe('POST /api/auth/register integration', () => {
  const payload = {
    username: 'new_user',
    password: 'Password123',
    fullName: 'Nguyen Van A',
    phone: '0987654321',
    email: 'new@example.com',
    role: 'CUSTOMER',
  };

  const ip = '10.0.0.1';

  beforeEach(() => {
    jest.resetAllMocks();
    resetRateLimit(ip);
  });

  it('returns 201 on success', async () => {
    mockRepo.findUserByUsername.mockResolvedValue(null);
    mockRepo.findUserByPhone.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createUserWithRelations.mockResolvedValue({
      user: { id: 'user-id', ...payload },
      refreshToken: {} as any,
    });

    const res = await request(buildApp())
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
  });

  it('returns 409 when username duplicate', async () => {
    mockRepo.findUserByUsername.mockResolvedValue({ id: 'existing' } as any);

    const res = await request(buildApp())
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('USERNAME_TAKEN');
  });

  it('returns 409 when phone duplicate', async () => {
    mockRepo.findUserByUsername.mockResolvedValue(null);
    mockRepo.findUserByPhone.mockResolvedValue({ id: 'existing' } as any);

    const res = await request(buildApp())
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('PHONE_DUPLICATED');
  });

  it('returns 409 when email duplicate', async () => {
    mockRepo.findUserByUsername.mockResolvedValue(null);
    mockRepo.findUserByPhone.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue({ id: 'existing' } as any);

    const res = await request(buildApp())
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_DUPLICATED');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(buildApp())
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send({ ...payload, phone: '123' });

    expect(res.status).toBe(400);
  });

  it('returns 429 after exceeding rate limit', async () => {
    mockRepo.findUserByUsername.mockResolvedValue(null);
    mockRepo.findUserByPhone.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createUserWithRelations.mockResolvedValue({
      user: { id: 'user-id', ...payload },
      refreshToken: {} as any,
    });
    const app = buildApp();
    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post('/api/auth/register')
        .set('x-forwarded-for', ip)
        .send({ ...payload, username: `${payload.username}${i}` });
    }
    const res = await request(app)
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send({ ...payload, username: 'blocked_user' });
    expect(res.status).toBe(429);
  });

  it('returns 500 when repository fails', async () => {
    mockRepo.findUserByUsername.mockResolvedValue(null);
    mockRepo.findUserByPhone.mockResolvedValue(null);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.createUserWithRelations.mockRejectedValue(new Error('db error'));

    const res = await request(buildApp())
      .post('/api/auth/register')
      .set('x-forwarded-for', ip)
      .send(payload);

    expect(res.status).toBe(500);
  });
});
