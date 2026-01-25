import { Router } from "express";
import { login, register } from "../modules/auth/controllers/auth.controller";
import { rateLimitMiddleware } from "../middleware/rateLimit";

const authRouter = Router();

authRouter.post("/register", rateLimitMiddleware, register);
authRouter.post("/login", rateLimitMiddleware, login);

export default authRouter;
