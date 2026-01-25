import {
  AuditAction,
  AuditStatus,
  Prisma,
  Role,
} from '@prisma/client';
import config from '../../../config/env';
import {
  findUserByEmail,
  findUserByPhone,
  findUserByUsername,
  createLoginAudit,
  createUserWithRelations,
} from '../repositories/user.repository';
import prisma from '../../../shared/prisma';
import { hashPassword, verifyPassword } from '../../../shared/hash';
import {
  signAccessToken,
  signRefreshToken,
} from '../../../shared/jwt';
import { LoginInput } from '../validators/login.validator';
import { RegisterInput } from '../validators/register.validator';
import logger from '../../../shared/logger';
import {
  registrationFailureCounter,
  registrationSuccessCounter,
  registrationDurationHistogram,
} from '../../../shared/metrics';

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const ttlToMs = (ttl: string): number => {
  const match = ttl.trim().match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid TTL format: ${ttl}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const map: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * map[unit];
};

const maskUsername = (value: string): string => {
  if (value.length <= 2) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 2)}***`;
};

export type RegisterContext = {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
};

type RegisterResult = {
  user: {
    id: string;
    username: string;
    fullName: string;
    phone: string;
    email: string;
    role: Role;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export type LoginContext = {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
};

type LoginResult = {
  user: {
    id: string;
    username: string;
    fullName: string;
    phone: string;
    email: string;
    role: Role;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export const registerUser = async (
  payload: RegisterInput,
  context: RegisterContext = {},
): Promise<RegisterResult> => {
  const endTimer = registrationDurationHistogram.startTimer();
  logger.info(
    { username: payload.username, role: payload.role },
    'register attempt',
  );
  const [existingUsername, existingPhone, existingEmail] = await Promise.all([
    findUserByUsername(payload.username),
    findUserByPhone(payload.phone),
    findUserByEmail(payload.email),
  ]);

  if (existingUsername) {
    registrationFailureCounter.inc();
    logger.warn({ username: payload.username }, 'username already taken');
    throw new ServiceError(
      'USERNAME_TAKEN',
      409,
      'Tên đăng nhập đã tồn tại',
    );
  }
  if (existingPhone) {
    registrationFailureCounter.inc();
    logger.warn({ phone: payload.phone }, 'phone already taken');
    throw new ServiceError('PHONE_DUPLICATED', 409, 'Số điện thoại đã tồn tại');
  }
  if (existingEmail) {
    registrationFailureCounter.inc();
    logger.warn({ email: payload.email }, 'email already taken');
    throw new ServiceError('EMAIL_DUPLICATED', 409, 'Email đã tồn tại');
  }

  const passwordHash = await hashPassword(payload.password);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: payload.username, role: payload.role }),
    signRefreshToken({ sub: payload.username, role: payload.role }),
  ]);
  const refreshTokenHash = await hashPassword(refreshToken);
  const refreshExpiresAt = new Date(
    Date.now() + ttlToMs(config.jwt.refresh.ttl),
  );

  try {
    const { user } = await createUserWithRelations({
      user: {
        username: payload.username,
        passwordHash,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        role: payload.role,
      },
      refreshToken: {
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
        deviceInfo: context.deviceInfo ?? null,
        ipAddress: context.ipAddress ?? null,
      },
      audit: {
        action: AuditAction.REGISTER,
        status: AuditStatus.SUCCESS,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      },
    });

    registrationSuccessCounter.inc();
    logger.info({ userId: user.id, username: user.username }, 'register success');

    const response = {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
    endTimer();
    return response;
  } catch (error) {
    registrationFailureCounter.inc();
    logger.error(
      { err: error, username: payload.username },
      'register failed',
    );
    endTimer();
    throw error;
  }
};

const buildInvalidUsernameError = (): ServiceError =>
  new ServiceError(
    'USERNAME_NOT_FOUND',
    401,
    'Ten dang nhap khong chinh xac! Vui long nhap lai.',
  );

const buildInvalidPasswordError = (): ServiceError =>
  new ServiceError(
    'PASSWORD_INCORRECT',
    401,
    'Mat khau khong chinh xac! Vui long nhap lai.',
  );

export const loginUser = async (
  payload: LoginInput,
  context: LoginContext = {},
): Promise<LoginResult> => {
  const maskedUsername = maskUsername(payload.username);
  logger.info(
    { username: maskedUsername, ipAddress: context.ipAddress },
    'login attempt',
  );
  const user = await findUserByUsername(payload.username);

  const recordFailedLogin = async () => {
    await createLoginAudit({
      action: AuditAction.LOGIN,
      status: AuditStatus.FAILED,
      reason: 'INVALID_CREDENTIALS',
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      ...(user
        ? { user: { connect: { id: user.id } } }
        : {}),
    });
  };

  if (!user) {
    await recordFailedLogin();
    logger.warn(
      { username: maskedUsername, ipAddress: context.ipAddress },
      'login failed: invalid credentials',
    );
    throw buildInvalidUsernameError();
  }

  const isValidPassword = await verifyPassword(
    payload.password,
    user.passwordHash,
  );
  if (!isValidPassword) {
    await recordFailedLogin();
    logger.warn(
      { userId: user.id, username: maskedUsername, ipAddress: context.ipAddress },
      'login failed: invalid credentials',
    );
    throw buildInvalidPasswordError();
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.username, role: user.role }),
    signRefreshToken({ sub: user.username, role: user.role }),
  ]);
  const refreshTokenHash = await hashPassword(refreshToken);
  const refreshExpiresAt = new Date(
    Date.now() + ttlToMs(config.jwt.refresh.ttl),
  );

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
        deviceInfo: context.deviceInfo ?? null,
        ipAddress: context.ipAddress ?? null,
        userId: user.id,
      },
    });
    await tx.loginAudit.create({
      data: {
        action: AuditAction.LOGIN,
        status: AuditStatus.SUCCESS,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        userId: user.id,
      },
    });
  });

  logger.info(
    { userId: user.id, username: maskedUsername },
    'login success',
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};
