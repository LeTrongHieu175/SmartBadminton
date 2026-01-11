import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import config from '../config/env';

export type JwtPayload = {
  sub: string;
  [key: string]: unknown;
};

const issuer = 'smart-badminton-api';

const normalizeKey = (value: string): string => value.replace(/\\n/g, '\n');

const readKey = (raw: string | undefined, rawBase64?: string): string => {
  if (rawBase64 && rawBase64.trim().length > 0) {
    return Buffer.from(rawBase64, 'base64').toString('utf8');
  }
  if (!raw || raw.trim().length === 0) {
    throw new Error('Missing JWT key material');
  }
  return normalizeKey(raw);
};

export const signAccessToken = async (
  payload: JwtPayload,
): Promise<string> => {
  const privateKey = readKey(
    config.jwt.access.privateKey,
    process.env.JWT_ACCESS_PRIVATE_KEY_BASE64,
  );
  const options: SignOptions = {
    algorithm: 'RS256',
    issuer,
    expiresIn: config.jwt.access.ttl as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, privateKey, options);
};

export const signRefreshToken = async (
  payload: JwtPayload,
): Promise<string> => {
  const privateKey = readKey(
    config.jwt.refresh.privateKey,
    process.env.JWT_REFRESH_PRIVATE_KEY_BASE64,
  );
  const options: SignOptions = {
    algorithm: 'RS256',
    issuer,
    expiresIn: config.jwt.refresh.ttl as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, privateKey, options);
};

export const verifyAccessToken = async (token: string): Promise<JwtPayload> => {
  const publicKey = readKey(
    config.jwt.access.publicKey,
    process.env.JWT_ACCESS_PUBLIC_KEY_BASE64,
  );
  const options: VerifyOptions = {
    algorithms: ['RS256'],
    issuer,
  };
  const decoded = jwt.verify(token, publicKey, options);
  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }
  return decoded as JwtPayload;
};

export const verifyRefreshToken = async (
  token: string,
): Promise<JwtPayload> => {
  const publicKey = readKey(
    config.jwt.refresh.publicKey,
    process.env.JWT_REFRESH_PUBLIC_KEY_BASE64,
  );
  const options: VerifyOptions = {
    algorithms: ['RS256'],
    issuer,
  };
  const decoded = jwt.verify(token, publicKey, options);
  if (typeof decoded === 'string') {
    throw new Error('Invalid JWT payload');
  }
  return decoded as JwtPayload;
};
