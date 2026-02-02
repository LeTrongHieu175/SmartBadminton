import { hashPassword, verifyPassword } from '../src/shared/hash';

describe('hash utilities', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('Password123');
    await expect(verifyPassword('Password123', hash)).resolves.toBe(true);
    await expect(verifyPassword('WrongPass', hash)).resolves.toBe(false);
  });

  it('produces different hashes for same plaintext', async () => {
    const hash1 = await hashPassword('Password123');
    const hash2 = await hashPassword('Password123');
    expect(hash1).not.toEqual(hash2);
  });
});
