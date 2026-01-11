import { Request, Response } from 'express';
import { ZodError } from 'zod';
import logger from '../../../shared/logger';
import { registerUser, ServiceError } from '../services/auth.service';
import { validateRegisterPayload } from '../validators/register.validator';

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = validateRegisterPayload(req.body);
    const result = await registerUser(parsed, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo: req.headers['x-device-info']?.toString(),
    });
    return res.success(result, 201);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.fail(
        { code: error.code, message: error.message },
        error.status,
      );
    }
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.fail(
        {
          code: 'VALIDATION_ERROR',
          message: 'Du lieu khong hop le',
          details,
        },
        400,
      );
    }
    logger.error({ err: error }, 'register failed');
    return res.fail(
      { code: 'INTERNAL_ERROR', message: 'Dang ky that bai' },
      500,
    );
  }
};
