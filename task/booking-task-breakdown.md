**Project Setup / Structure**
- [x] Task 1: Create module folder `backend/src/modules/bookings/` with subfolders `controllers`, `services`, `repositories`, `validators`, `types`. (Completed)
- [x] Task 2: Add route file `backend/src/routes/booking.routes.ts` (or follow existing naming pattern if different). (Completed)

**Database & Prisma**
- [x] Task 3: Update `backend/prisma/schema.prisma` Booking model with `userId`, `unitPrice`, `totalPrice`, `durationMinutes`, `expiresAt` fields. (Completed)
- [x] Task 4: Add Booking -> User relation and back-reference on User (if needed by pattern). (Completed)
- [x] Task 5: Update `BookingStatus` enum to include `EXPIRED` (and keep `CANCELED` for future manual cancel). (Completed)
- [x] Task 6: Add indexes `(courtId,startTime,endTime,status)`, `(userId,createdAt)`, `(expiresAt,status)`. (Completed)
- [x] Task 7: Generate Prisma migration and review SQL (depends on Task 3?6). (Completed)
- [x] Task 8: Update `backend/prisma/seed.ts` to include sample booking with new fields (depends on Task 7). (Completed)

**Validation (Zod)**
- [x] Task 9: Create validator file `backend/src/modules/bookings/validators/create-booking.validator.ts` with rules:
  - `courtId` UUID
  - `startTime < endTime`
  - 30-minute step
  - within 06:00?23:00
  - durationMinutes within min/max (TBD) (Completed)
- [x] Task 10: Add validator unit tests in `backend/tests/...` for edge cases (boundary times, wrong step, invalid ranges).

**Repository Layer**
- [x] Task 11: Create `backend/src/modules/bookings/repositories/booking.repository.ts` with:
  - `checkOverlap(courtId, startTime, endTime)`
  - `createBooking(data)` (Completed)
- [x] Task 12: Ensure overlap logic matches existing available-courts rule `start < bookingEnd && end > bookingStart`. (Completed)

**Service Layer**
- [x] Task 13: Create `backend/src/modules/bookings/services/create-booking.service.ts` that:
  - computes `durationMinutes`
  - fetches court and base price by `courtId`
  - computes `unitPrice` and `totalPrice`
  - sets `status=PENDING_PAYMENT`, `expiresAt=now+15m`
  - wraps overlap check + create in Prisma transaction (Completed)
- [x] Task 14: Add service unit tests: duration calc, price snapshot, overlap conflict, invalid courtId.

**Controller Layer**
- [x] Task 15: Create `backend/src/modules/bookings/controllers/booking.controller.ts` with `createBookingHandler`. (Completed)
- [x] Task 16: Ensure controller uses shared response helpers and error handling patterns. (Completed)

**Routing & Middleware**
- [x] Task 17: Wire `POST /api/bookings` in `backend/src/routes/booking.routes.ts` with middleware stack:
  - `authenticate`
  - `requireRole(CUSTOMER)`
  - `rateLimit` (existing pattern)
  - `validate(createBooking)`
  - `booking.controller.createBookingHandler` (Completed)
- [x] Task 18: Mount booking routes in `backend/src/app.ts`. (Completed)
- [x] Task 19: Add/extend audit logging for booking creation (if there is an audit helper, reuse it). (Completed)

**Queue & Worker (Redis/BullMQ)**
- [x] Task 20: Add BullMQ queue setup in `backend/src/shared/queue.ts` (or existing location) using `REDIS_URL`. (Completed)
- [x] Task 21: Enqueue delayed expire job when booking is created (delay 15 minutes) in service layer. (Completed)
- [x] Task 22: Implement worker `backend/src/workers/booking-expire.worker.ts` to:
  - load booking by id
  - verify `status=PENDING_PAYMENT` and `expiresAt <= now`
  - update to `EXPIRED` (Completed)
- [x] Task 23: Register worker in app startup (or a separate worker runner script). (Completed)
- [x] Task 24: Add retry/backoff strategy for worker failures and log errors. (Completed)

**Config & Env**
- [x] Task 25: Add `REDIS_URL` and `BOOKING_EXPIRE_MINUTES=15` to `docs/setup.md` and sample env template. (Completed)
- [x] Task 26: Add config loader for booking expire minutes if config module exists. (Completed)

**Observability**
- [x] Task 27: Add metrics in `backend/src/shared/metrics.ts`:
  - `bookings_created_total`
  - `bookings_create_latency_ms`
  - `bookings_expired_total` (Completed)
- [x] Task 28: Add structured logs for booking create and expire worker actions. (Completed)

**OpenAPI / Docs**
- [x] Task 29: Update OpenAPI spec file in `docs/api/` with `POST /api/bookings` schema, auth, error cases. (Completed)
- [x] Task 30: Update `docs/ops.md` with Redis/BullMQ worker operational notes. (Completed)

**Testing (Integration / API)**
- [ ] Task 31: Add Supertest API test for booking success path.
- [ ] Task 32: Add Supertest API test for overlap conflict (expect 409).
- [ ] Task 33: Add Supertest API test for invalid payload and forbidden role.
- [ ] Task 34: Add integration test for worker: create PENDING_PAYMENT booking -> enqueue -> status EXPIRED.

**Decisions / Open Questions**
- [ ] Task 35: Decide min/max booking duration and update validator + tests.
- [ ] Task 36: Confirm currency unit (VND) and adjust response/docs if needed.
- [ ] Task 37: Define peak-hour owner feature scope (future TDD).
