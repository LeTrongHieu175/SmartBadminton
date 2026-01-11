import { registerSchema } from '../../src/modules/auth/validators/register.validator';

describe('registerSchema', () => {
  it('validates correct payload', () => {
    const data = registerSchema.parse({
      username: 'user_001',
      password: 'Password123',
      fullName: 'Nguyen Van A',
      phone: '0987654321',
      email: 'user@example.com',
      role: 'CUSTOMER',
    });
    expect(data.username).toBe('user_001');
  });

  it('rejects invalid phone', () => {
    expect(() =>
      registerSchema.parse({
        username: 'user_001',
        password: 'Password123',
        fullName: 'Nguyen Van A',
        phone: '123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      }),
    ).toThrow();
  });

  it('rejects password without uppercase', () => {
    expect(() =>
      registerSchema.parse({
        username: 'user_002',
        password: 'password123',
        fullName: 'Le Thi B',
        phone: '0911222333',
        email: 'user2@example.com',
        role: 'OWNER',
      }),
    ).toThrow('Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa');
  });

  it('rejects username with invalid chars', () => {
    expect(() =>
      registerSchema.parse({
        username: 'user-003',
        password: 'Password123',
        fullName: 'Tran C',
        phone: '0988888777',
        email: 'user3@example.com',
        role: 'CUSTOMER',
      }),
    ).toThrow();
  });

  it('rejects full name with digits', () => {
    expect(() =>
      registerSchema.parse({
        username: 'user004',
        password: 'Password123',
        fullName: 'Nam 123',
        phone: '0977777666',
        email: 'user4@example.com',
        role: 'CUSTOMER',
      }),
    ).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() =>
      registerSchema.parse({
        username: 'user005',
        password: 'Password123',
        fullName: 'Pham D',
        phone: '0966666555',
        email: 'invalid-email',
        role: 'CUSTOMER',
      }),
    ).toThrow();
  });
});
