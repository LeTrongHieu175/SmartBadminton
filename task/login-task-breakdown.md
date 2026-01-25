**Data Model**
- [x] Task 1: Add `LOGIN` to `AuditAction` enum in `backend/prisma/schema.prisma`. (Completed)
- [x] Task 2: Create Prisma migration for enum change (user-run `prisma migrate`) and update generated client (user-run `prisma generate`). (Completed)

**Validation**
- [x] Task 3: Define login Zod schema (username, password) in `backend/src/modules/auth/validators/login.validator.ts`. (Completed)
- [x] Task 4: Add `validateLoginPayload` helper with `zod` parse and export `LoginInput` type. (Completed)

**Routing**
- [x] Task 5: Add `POST /api/auth/login` route in `backend/src/routes/auth.routes.ts`. (Completed)
- [x] Task 6: Attach `rateLimitMiddleware` to login route. (Completed)

**Controller**
- [x] Task 7: Add `login` handler in `backend/src/modules/auth/controllers/auth.controller.ts`. (Completed)
- [x] Task 8: Wire controller to validator and service, map `ServiceError` to `res.fail` with status codes. (Completed)
- [x] Task 9: Add `ZodError` handling to return `VALIDATION_ERROR` for login payloads. (Completed)

**Repository**
- [x] Task 10: Add repository helper to create `LoginAudit` (if not reused) in `backend/src/modules/auth/repositories/user.repository.ts`. (Completed - already present)
- [x] Task 11: Add repository helper to create `RefreshToken` (if not reused) in `backend/src/modules/auth/repositories/user.repository.ts`. (Completed - already present)

**Service**
- [x] Task 12: Add `loginUser` service in `backend/src/modules/auth/services/auth.service.ts`. (Completed)
- [x] Task 13: Implement user lookup by username and password verification via `verifyPassword`. (Completed)
- [x] Task 14: Implement access/refresh token signing and refresh token hashing. (Completed)
- [x] Task 15: Persist refresh token + login audit in a transaction. (Completed)
- [x] Task 16: Return response payload with `user` and `tokens`. (Completed)
- [x] Task 17: Handle invalid credentials with `ServiceError` (`INVALID_CREDENTIALS`, 401) without user enumeration. (Completed)

**Observability**
- [x] Task 18: Add login metrics (`auth_login_success_total`, `auth_login_failure_total`, `auth_login_duration_ms`) in `backend/src/shared/metrics.ts`. (Completed)
- [x] Task 19: Add structured logs for login attempts/success/failure in service/controller (mask username if needed). (Completed)

**Docs & Contract**
- [x] Task 20: Update `docs/api/auth.yaml` to include `/api/auth/login` request/response schema. (Completed)
- [x] Task 21: Add error response examples for `INVALID_CREDENTIALS`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`. (Completed)

**Testing - Unit**
- [ ] Task 22: Add unit test for login happy path in `backend/tests/modules/auth/auth.service.test.ts`.
- [ ] Task 23: Add unit test for invalid credentials (user not found).
- [ ] Task 24: Add unit test for invalid credentials (password mismatch).
- [ ] Task 25: Add unit test for repository failure propagation.

**Testing - Integration**
- [ ] Task 26: Add integration test for 200 success in `backend/tests/integration/login.integration.test.ts`.
- [ ] Task 27: Add integration test for 401 invalid credentials.
- [ ] Task 28: Add integration test for 400 validation error.
- [ ] Task 29: Add integration test for 429 rate limited.
- [ ] Task 30: Add integration test for 500 internal error.

**Testing - Contract**
- [ ] Task 31: Add contract test for login success response vs OpenAPI in `backend/tests/integration/login.contract.test.ts`.
- [ ] Task 32: Add contract test for login error response vs OpenAPI.
