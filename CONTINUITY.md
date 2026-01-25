Goal (incl. success criteria):
- Support SmartBadminton documentation/tasks while enforcing rule set (esp. technical/design docs) and keeping ledger current.

Constraints/Assumptions:
- Must always apply rule documents under `C:\Users\yasuo\Desktop\SmartBadminton\rule`.
- Continuity ledger must be maintained per instructions.
- Begin each reply with a brief “Ledger Snapshot” (Goal + Now/Next + Open Questions).
- Work exclusively within `C:\Users\yasuo\Desktop\SmartBadminton` workspace.
- Replies must be in Vietnamese.
- Do not run DB/migration/server commands autonomously; request user execution when needed.

Key decisions:
- Ledger/rule compliance established; registration TDD + task breakdown completed.
- Requirements locked: user stories, validation rules, API contract, data model (refresh_tokens/login_audit), JWT/BCrypt, rate limiting; reCAPTCHA out-of-scope.
- Architecture fixed: MVC structure under `backend/{prisma,src(config|middleware|modules|routes|shared),tests}`.
- Implementation delivered for Tasks 1–20 (schema, config, middleware, services, routes, docs, tests) plus Docker stack.
- JWT uses asymmetric keys and `jsonwebtoken` (CommonJS-friendly); env vars documented.

State:
  - Done:
    - All rule docs reviewed; TDD + task breakdown completed for registration flow.
    - Implemented Tasks 1–20 (schema, config, middleware, services, routes, docs) plus unit/integration/contract tests.
    - Added backend Dockerfile and docker-compose for local stack.
    - Switched JWT helper to `jsonwebtoken`.
    - Rewrote `project_overview.md` with deeper detail per `project-overview-rule.mdc`.
    - Drafted login TDD at `TDD/login-tdd.md`.
    - Created login task breakdown at `task/login-task-breakdown.md`.
    - Added `LOGIN` to `AuditAction` enum in `backend/prisma/schema.prisma` (Task 1).
    - Added login validator schema in `backend/src/modules/auth/validators/login.validator.ts` (Task 3).
    - Completed Task 2 (Prisma migration + generate, user-run) and Task 4 (validateLoginPayload helper).
    - Added login route in `backend/src/routes/auth.routes.ts` (Task 5).
    - Attached rate limit middleware to login route (Task 6).
    - Added login controller handler in `backend/src/modules/auth/controllers/auth.controller.ts` (Task 7).
    - Wired login controller to validator/service and ServiceError mapping (Task 8).
    - Added ZodError handling for login payload validation (Task 9).
    - Verified `createLoginAudit` repository helper already exists (Task 10).
    - Verified `createRefreshToken` repository helper already exists (Task 11).
    - Implemented login service with validation, token issuance, and audit persistence (Tasks 12-17).
    - Added login metrics counters/histogram in `backend/src/shared/metrics.ts` (Task 18).
    - Added structured login logs in `backend/src/modules/auth/services/auth.service.ts` (Task 19).
    - Updated OpenAPI spec with login endpoint in `docs/api/auth.yaml` (Task 20).
    - Added OpenAPI error examples for login in `docs/api/auth.yaml` (Task 21).
    - Read `rule/continuity-ledger-rule.mdc` and will apply it on every request.
    - Added DB connection check on server start in `backend/src/app.ts` with success/failure logging.
    - Read `docs/CNM.pdf` spec and reviewed registration API for alignment.
    - Updated login validation to require non-empty fields and adjusted login errors to match spec messages.
  - Now:
    - Ready for Task 22 (unit test for login happy path).
  - Next:
    - Implement Task 22 after confirmation.

Open questions (`UNCONFIRMED` if needed):
- User asked what inputs are needed to write a proper TDD for “Xem danh sách sân trống”.

Working set (files/ids/commands):
- `rule/continuity-ledger-rule.mdc`
- `rule/implementation-rule.mdc`
- `rule/project-overview-rule.mdc`
- `rule/task-breakdown-rule.mdc`
- `rule/technical-design-documentation-rule.mdc`
- `CONTINUITY.md`
- `project_overview.md`
- `docs/CNM (1).pdf`
- `TDD/login-tdd.md`
- `task/login-task-breakdown.md`
- `backend/prisma/schema.prisma`
- `backend/src/modules/auth/validators/login.validator.ts`
- `backend/src/modules/auth/services/auth.service.ts`
- `docs/api/auth.yaml`
- `backend/src/shared/metrics.ts`
- `backend/src/modules/auth/services/auth.service.ts`
