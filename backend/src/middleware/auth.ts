import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, JwtPayload } from "../shared/jwt";

type AuthUser = {
  username: string;
  role?: string;
  payload: JwtPayload;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.fail({ code: "UNAUTHORIZED", message: "Chua dang nhap" }, 401);
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.fail({ code: "UNAUTHORIZED", message: "Chua dang nhap" }, 401);
    return;
  }

  try {
    const payload = await verifyAccessToken(token);
    req.user = {
      username: String(payload.sub ?? ""),
      role: payload.role as string | undefined,
      payload,
    };
    next();
  } catch {
    res.fail({ code: "UNAUTHORIZED", message: "Token khong hop le" }, 401);
  }
};

export const requireRole =
  (role: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.fail({ code: "UNAUTHORIZED", message: "Chua dang nhap" }, 401);
      return;
    }
    if (req.user.role !== role) {
      res.fail({ code: "FORBIDDEN", message: "Khong co quyen truy cap" }, 403);
      return;
    }
    next();
  };
