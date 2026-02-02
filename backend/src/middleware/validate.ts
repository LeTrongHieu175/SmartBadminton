import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import logger from "../shared/logger";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res.fail(
          {
            code: "VALIDATION_ERROR",
            message: "Du lieu khong hop le",
            details,
          },
          400,
        );
        return;
      }
      logger.error({ err: error }, "validation middleware failed");
      res.fail(
        { code: "INTERNAL_ERROR", message: "Khong the xu ly yeu cau" },
        500,
      );
    }
  };
