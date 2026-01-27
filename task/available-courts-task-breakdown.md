**Database & Prisma**
- [x] Task 1: Add `CourtType` enum in `backend/prisma/schema.prisma`.
- [x] Task 2: Add `BookingStatus` enum in `backend/prisma/schema.prisma`.
- [x] Task 3: Add `Court` model (id, name, type, basePrice, isActive, timestamps) in `backend/prisma/schema.prisma`.
- [x] Task 4: Add `Booking` model (id, courtId, date, startTime, endTime, status, timestamps) in `backend/prisma/schema.prisma`.
- [x] Task 5: Add indexes for booking availability search (courtId, date, startTime, endTime, status).
- [x] Task 6: Create Prisma migration for the new models (user-run).
- [x] Task 7: Run `prisma generate` after migration (user-run).

**Routing & Middleware**
- [x] Task 8: Create new router file `backend/src/routes/court.routes.ts`.
- [x] Task 9: Register `court.routes.ts` in `backend/src/app.ts` under `/api/courts`.
- [x] Task 10: Add auth middleware to protect `GET /api/courts/available`.
- [x] Task 11: Add role-based middleware to restrict access to `CUSTOMER`.

**Validation**
- [x] Task 12: Create validator schema for query params in `backend/src/modules/courts/validators/available-courts.validator.ts`.
- [x] Task 13: Validate `date` format `YYYY-MM-DD`.
- [x] Task 14: Validate `startTime`/`endTime` format `HH:mm`.
- [x] Task 15: Validate `startTime < endTime`.
- [x] Task 16: Validate time window within 06:00�23:00.

**Repository Layer**
- [x] Task 17: Create `backend/src/modules/courts/repositories/court.repository.ts`.
- [x] Task 18: Implement query to fetch active courts without overlapping bookings on a date.
- [x] Task 19: Ensure overlap logic uses `requestedStart < bookingEnd` and `requestedEnd > bookingStart`.

**Service Layer**
- [x] Task 20: Create service `backend/src/modules/courts/services/available-courts.service.ts`.
- [x] Task 21: Compute `durationMinutes` from input window.
- [x] Task 22: Return `NO_AVAILABLE_COURTS` error when result is empty.

**Controller Layer**
- [x] Task 23: Create controller `backend/src/modules/courts/controllers/court.controller.ts`.
- [x] Task 24: Implement `getAvailableCourts` handler using responseMiddleware.
- [x] Task 25: Map validation errors to `VALIDATION_ERROR` and service errors to proper status codes.

**Routes**
- [x] Task 26: Add `GET /available` in `court.routes.ts` with auth + role + validation middleware.

**Observability**
- [x] Task 27: Add structured logs for search criteria and result count.
- [x] Task 28: Add metrics counters/histogram in `backend/src/shared/metrics.ts`.

**Testing - Unit**
- [x] Task 29: Unit test validator edge cases (missing fields, invalid time format, out-of-range).
- [x] Task 30: Unit test overlap logic with booking intervals.
- [x] Task 31: Unit test service for empty result -> `NO_AVAILABLE_COURTS`.

**Testing - Integration**
- [x] Task 32: Integration test 200 success case.
- [x] Task 33: Integration test 400 validation error.
- [x] Task 34: Integration test 401 unauthorized.
- [x] Task 35: Integration test 403 forbidden (non-CUSTOMER).
- [x] Task 36: Integration test 404 no available courts.

**Documentation**
- [x] Task 37: Update `docs/api` OpenAPI spec with `GET /api/courts/available`.
- [x] Task 38: Add error examples for 400/401/403/404.
- [x] Task 39: Update `docs/ops.md` for new metrics/logging (if applicable).

**Open Questions**
- [x] Task 40: Confirm p95 latency target and booking statuses that block availability; update TDD accordingly.
