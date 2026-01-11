import 'dotenv/config';

type JwtConfig = {
  privateKey: string;
  publicKey: string;
  ttl: string;
};

export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  logLevel: string;
  jwt: {
    access: JwtConfig;
    refresh: JwtConfig;
  };
  bcrypt: {
    saltRounds: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    store?: 'memory' | 'redis';
  };
};

const requiredVars = ['DATABASE_URL', 'ACCESS_TOKEN_TTL', 'REFRESH_TOKEN_TTL'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const hasAccessKey =
  process.env.JWT_ACCESS_PRIVATE_KEY ||
  process.env.JWT_ACCESS_PRIVATE_KEY_BASE64;
const hasAccessPub =
  process.env.JWT_ACCESS_PUBLIC_KEY ||
  process.env.JWT_ACCESS_PUBLIC_KEY_BASE64;
const hasRefreshKey =
  process.env.JWT_REFRESH_PRIVATE_KEY ||
  process.env.JWT_REFRESH_PRIVATE_KEY_BASE64;
const hasRefreshPub =
  process.env.JWT_REFRESH_PUBLIC_KEY ||
  process.env.JWT_REFRESH_PUBLIC_KEY_BASE64;

if (!hasAccessKey) {
  throw new Error(
    'Missing required environment variable: JWT_ACCESS_PRIVATE_KEY or JWT_ACCESS_PRIVATE_KEY_BASE64',
  );
}
if (!hasAccessPub) {
  throw new Error(
    'Missing required environment variable: JWT_ACCESS_PUBLIC_KEY or JWT_ACCESS_PUBLIC_KEY_BASE64',
  );
}
if (!hasRefreshKey) {
  throw new Error(
    'Missing required environment variable: JWT_REFRESH_PRIVATE_KEY or JWT_REFRESH_PRIVATE_KEY_BASE64',
  );
}
if (!hasRefreshPub) {
  throw new Error(
    'Missing required environment variable: JWT_REFRESH_PUBLIC_KEY or JWT_REFRESH_PUBLIC_KEY_BASE64',
  );
}

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable must be a number, got: ${value}`);
  }
  return parsed;
};

const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 3000),
  databaseUrl: process.env.DATABASE_URL as string,
  logLevel: process.env.LOG_LEVEL ?? 'info',
  jwt: {
    access: {
      privateKey: process.env.JWT_ACCESS_PRIVATE_KEY as string,
      publicKey: process.env.JWT_ACCESS_PUBLIC_KEY as string,
      ttl: process.env.ACCESS_TOKEN_TTL ?? '15m',
    },
    refresh: {
      privateKey: process.env.JWT_REFRESH_PRIVATE_KEY as string,
      publicKey: process.env.JWT_REFRESH_PUBLIC_KEY as string,
      ttl: process.env.REFRESH_TOKEN_TTL ?? '30d',
    },
  },
  bcrypt: {
    saltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  },
  rateLimit: {
    windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toNumber(process.env.RATE_LIMIT_MAX, 5),
    store:
      process.env.RATE_LIMIT_STORE === 'redis'
        ? 'redis'
        : ('memory' as 'memory' | 'redis'),
  },
};

export default config;
