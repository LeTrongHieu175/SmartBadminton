import request from 'supertest';
import express from 'express';
import { responseMiddleware } from '../../src/shared/response';
import { rateLimitMiddleware, resetRateLimit } from '../../src/middleware/rateLimit';

const buildApp = () => {
  const app = express();
  app.use(responseMiddleware);
  app.use(rateLimitMiddleware);
  app.get('/', (_req, res) => res.success({ ok: true }));
  return app;
};

describe('rateLimitMiddleware', () => {
  it('allows requests under the limit', async () => {
    const app = buildApp();
    const resp = await request(app).get('/');
    expect(resp.status).toBe(200);
  });

  it('exposes reset hook for tests', async () => {
    const app = buildApp();
    const ip = 'test-ip';
    for (let i = 0; i < 5; i += 1) {
      await request(app).get('/').set('x-forwarded-for', ip);
    }
    const limited = await request(app).get('/').set('x-forwarded-for', ip);
    expect(limited.status).toBe(429);
    resetRateLimit(ip);
    const afterReset = await request(app).get('/').set('x-forwarded-for', ip);
    expect(afterReset.status).toBe(200);
  });
});
