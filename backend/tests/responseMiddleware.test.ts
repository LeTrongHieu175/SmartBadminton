import request from 'supertest';
import express from 'express';
import { responseMiddleware } from '../../src/shared/response';

const buildApp = () => {
  const app = express();
  app.use(responseMiddleware);
  app.get('/success', (_req, res) => {
    res.success({ foo: 'bar' }, 201);
  });
  app.get('/error', (_req, res) => {
    res.fail({ code: 'ERR', message: 'Oops' }, 422);
  });
  return app;
};

describe('responseMiddleware', () => {
  it('wraps success payloads', async () => {
    const app = buildApp();
    const resp = await request(app).get('/success');
    expect(resp.status).toBe(201);
    expect(resp.body).toEqual({ status: 'success', data: { foo: 'bar' } });
  });

  it('wraps error payloads', async () => {
    const app = buildApp();
    const resp = await request(app).get('/error');
    expect(resp.status).toBe(422);
    expect(resp.body).toEqual({
      status: 'error',
      code: 'ERR',
      message: 'Oops',
    });
  });
});
