import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import { createBookingHandler } from "../modules/bookings/controllers/booking.controller";
import { createBookingValidator } from "../modules/bookings/validators/create-booking.validator";

const bookingRouter = Router();

bookingRouter.post(
  "/",
  authenticate,
  requireRole("CUSTOMER"),
  rateLimitMiddleware,
  validate(createBookingValidator),
  createBookingHandler,
);

export default bookingRouter;
