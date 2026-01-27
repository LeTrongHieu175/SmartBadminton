import { Request, Response } from "express";
import { ZodError } from "zod";
import logger from "../../../shared/logger";
import {
  getAvailableCourts,
  ServiceError,
} from "../services/available-courts.service";
import { validateAvailableCourtsQuery } from "../validators/available-courts.validator";

export const getAvailableCourtsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const parsed = validateAvailableCourtsQuery(req.query);
    const result = await getAvailableCourts(parsed);
    return res.success(result, 200);
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
          code: "VALIDATION_ERROR",
          message: "Du lieu khong hop le",
          details,
        },
        400,
      );
    }
    logger.error({ err: error }, "get available courts failed");
    return res.fail(
      { code: "INTERNAL_ERROR", message: "Khong the lay danh sach san" },
      500,
    );
  }
};
