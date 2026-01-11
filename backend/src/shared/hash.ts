import bcrypt from 'bcryptjs';
import config from '../config/env';

export const hashPassword = (plain: string): Promise<string> => {
  return bcrypt.hash(plain, config.bcrypt.saltRounds);
};

export const verifyPassword = (
  plain: string,
  hashed: string,
): Promise<boolean> => bcrypt.compare(plain, hashed);
