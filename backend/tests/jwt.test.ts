import { signAccessToken, verifyAccessToken } from '../../src/shared/jwt';

describe('jwt utilities', () => {
  it('signs and verifies access tokens', async () => {
    const token = await signAccessToken({ sub: 'user-1', role: 'CUSTOMER' });
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('CUSTOMER');
  });

  it('throws on invalid token', async () => {
    await expect(verifyAccessToken('invalid.token')).rejects.toThrow();
  });
});
