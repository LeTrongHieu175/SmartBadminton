**Database & Configuration**
- [x] Task 1: Update `backend/prisma/schema.prisma` with `User`, `RefreshToken`, `LoginAudit` models (UUID ids, enums, unique indexes) 
- [x] Task 2: Define Prisma enum for roles (`CUSTOMER`, `OWNER`) and ensure generated client typings are updated.
- [x] Task 3: Extend configuration loader to read asymmetric JWT keys, token TTLs, rate-limit thresholds, and bcrypt rounds from `.env`.
- [x] Task 4: Document new environment variables in `docs/setup.md` (or README) and ensure secrets are excluded via `.gitignore`.

**Shared Middleware & Utilities**
- [x] Task 5: Implement standardized response helper/middleware to enforce `{status,data,error}` envelope across controllers.
- [x] Task 6: Create `rateLimitMiddleware` using `express-rate-limit` (5 req/15 ph�t/IP) with reset hook for tests.
- [x] Task 7: Implement request validation schema with `zod` (`register.validator.ts`) enforcing username/password/fullName/phone/email/role rules.
- [x] Task 8: Build shared utilities for hashing (`BCrypt` wrapper) and JWT signing/verification using RS256 key pairs.

**Repository & Service Layer**
- [x] Task 9: Implement Prisma repositories for users, refresh tokens, and login audit, including duplicate lookups and transactional creation.
- [x] Task 10: Implement `registerUser` service (hash password, detect duplicates, persist user, store refresh token hash, insert audit log, assemble response DTO) (depends on Tasks 7-9).
- [x] Task 11: Add structured logging + metrics hooks within the service to record success/failure and emit counters.

**Routing & Controller**
- [x] Task 12: Add `POST /api/auth/register` route in `routes/auth.routes.ts` wiring response bootstrap, rate limit, validation, and controller.
- [x] Task 13: Implement controller handler delegating to service, mapping business errors to HTTP status codes, and returning standardized payload.

**Security & Operations**
- [x] Task 14: Configure HTTPS/production assumptions, ensuring sensitive data masking in logs and audit entries (documented in ops notes).
- [x] Task 15: Add metrics counters/histogram exports (`auth_registration_*`) and integrate with existing monitoring setup.

**Testing**
- [x] Task 16: Write Jest unit tests for validation schema edge cases and hasher/JWT utilities.
- [x] Task 17: Write Jest unit tests for `auth.service` covering happy path, duplicate username/phone/email, and error propagation (mock repositories/JWT).
- [x] Task 18: Create Supertest integration suite against Express app + test Prisma DB covering success, duplicates, invalid payload, rate limit (with reset hook), and DB failure fallbacks.
- [x] Task 19: Implement API contract tests validating success/error responses against OpenAPI/JSON schema (`docs/api/auth.yaml`).

**Documentation & CI**
- [x] Task 20: Update OpenAPI spec (`docs/api/auth.yaml`) with request/response schema and error codes for registration endpoint.
- [ ] Task 21: Ensure CI pipeline runs new tests/migrations and adds any required secrets/config references (depends on Tasks 3,16-19).