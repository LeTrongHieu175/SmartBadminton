import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { getAvailableCourtsHandler } from "../modules/courts/controllers/court.controller";

const courtRouter = Router();

courtRouter.get(
  "/available",
  authenticate,
  requireRole("CUSTOMER"),
  getAvailableCourtsHandler,
);

export default courtRouter;
