import { Router } from 'express';
import { register } from '../modules/auth/controllers/auth.controller';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const authRouter = Router();

authRouter.post('/register', rateLimitMiddleware, register);

export default authRouter;
