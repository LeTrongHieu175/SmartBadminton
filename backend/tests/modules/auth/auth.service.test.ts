import * as userRepo from '../../../src/modules/auth/repositories/user.repository';
import * as hashUtils from '../../../src/shared/hash';
import * as jwtUtils from '../../../src/shared/jwt';
import { registerUser, ServiceError } from '../../../src/modules/auth/services/auth.service';

jest.mock('../../../src/modules/auth/repositories/user.repository');
jest.mock('../../../src/shared/hash');
jest.mock('../../../src/shared/jwt');

const mockUserRepo = userRepo as jest.Mocked<typeof userRepo>;
const mockHash = hashUtils as jest.Mocked<typeof hashUtils>;
const mockJwt = jwtUtils as jest.Mocked<typeof jwtUtils>;

describe('registerUser', () => {
  const baseInput = {
    username: 'new_user',
    password: 'Password123',
    fullName: 'Nguyen Van A',
    phone: '0987654321',
    email: 'new@example.com',
    role: 'CUSTOMER' as const,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('registers user on happy path', async () => {
    mockUserRepo.findUserByUsername.mockResolvedValue(null);
    mockUserRepo.findUserByPhone.mockResolvedValue(null);
    mockUserRepo.findUserByEmail.mockResolvedValue(null);
    mockHash.hashPassword.mockResolvedValueOnce('hashed-pass');
    mockJwt.signAccessToken.mockResolvedValue('access');
    mockJwt.signRefreshToken.mockResolvedValue('refresh');
    mockHash.hashPassword.mockResolvedValueOnce('hashed-refresh');
    mockUserRepo.createUserWithRelations.mockResolvedValue({
      user: {
        id: 'user-id',
        username: baseInput.username,
        fullName: baseInput.fullName,
        phone: baseInput.phone,
        email: baseInput.email,
        role: 'CUSTOMER',
      } as any,
      refreshToken: {} as any,
    });

    const result = await registerUser(baseInput);

    expect(result.user.id).toBe('user-id');
    expect(result.tokens.accessToken).toBe('access');
  });

  it('throws when username already exists', async () => {
    mockUserRepo.findUserByUsername.mockResolvedValue({ id: 'existing' } as any);

    await expect(registerUser(baseInput)).rejects.toThrow(ServiceError);
  });

  it('throws when phone already exists', async () => {
    mockUserRepo.findUserByUsername.mockResolvedValue(null);
    mockUserRepo.findUserByPhone.mockResolvedValue({ id: 'existing' } as any);

    await expect(registerUser(baseInput)).rejects.toThrow('Số điện thoại đã tồn tại');
  });

  it('throws when email already exists', async () => {
    mockUserRepo.findUserByUsername.mockResolvedValue(null);
    mockUserRepo.findUserByPhone.mockResolvedValue(null);
    mockUserRepo.findUserByEmail.mockResolvedValue({ id: 'existing' } as any);

    await expect(registerUser(baseInput)).rejects.toThrow('Email đã tồn tại');
  });

  it('propagates unexpected errors', async () => {
    mockUserRepo.findUserByUsername.mockResolvedValue(null);
    mockUserRepo.findUserByPhone.mockResolvedValue(null);
    mockUserRepo.findUserByEmail.mockResolvedValue(null);
    mockHash.hashPassword.mockResolvedValue('hash');
    mockJwt.signAccessToken.mockResolvedValue('access');
    mockJwt.signRefreshToken.mockResolvedValue('refresh');
    mockUserRepo.createUserWithRelations.mockRejectedValue(new Error('db error'));

    await expect(registerUser(baseInput)).rejects.toThrow('db error');
  });
});
