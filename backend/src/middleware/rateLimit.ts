import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import config from '../config/env';

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  message: {
    status: 'error',
    code: 'RATE_LIMITED',
    message: 'Too many requests, please try again later.',
  },
});

export const rateLimitMiddleware = limiter;

export const resetRateLimit = (key: string): void => {
  const store: unknown = (limiter as unknown as { store?: unknown })?.store;
  const reset = (
    (limiter as unknown as { resetKey?: (k: string) => void }).resetKey ??
    (store as { resetKey?: (k: string) => void })?.resetKey
  );
  if (typeof reset === 'function') {
    reset(key);
  }
};
