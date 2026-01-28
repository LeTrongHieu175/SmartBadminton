# SmartBadminton Project Overview

## Project Structure

```
.
|- backend/                         # Node.js/Express backend
|  |- prisma/
|  |  |- migrations/                # Prisma migrations
|  |  |- schema.prisma              # Prisma schema (User, Court, Booking, etc.)
|  |  |- seed.ts                    # Seed data for courts/bookings
|  |- src/
|  |  |- app.ts                     # Express bootstrap
|  |  |- config/                    # env loader + validation
|  |  |- middleware/                # auth + rate limiting
|  |  |- modules/
|  |  |  |- auth/                   # auth controllers/services/repos/validators
|  |  |  |- courts/                 # available courts module
|  |  |- routes/                    # HTTP routers
|  |  |- shared/                    # jwt, prisma client, response helpers, logs, metrics
|  |- tests/                        # unit + integration + contract tests
|- docs/
|  |- api/                          # OpenAPI specs (auth.yaml, courts.yaml)
|  |- ops.md                        # operations/security notes
|  |- setup.md                      # env setup
|- infra/
|  |- Docker/                       # backend Dockerfile
|  |- docker-compose.yml            # local stack
|- task/                            # task checklists
|- TDD/                             # technical design docs
```

## Key Patterns & Concepts

1. **Express bootstrap + standardized responses**
   - App wires middleware, routers, and a shared response wrapper for consistent success/error shapes.
   - Code: ````1:39:backend/src/app.ts````
   - Code: ````25:47:backend/src/shared/response.ts````

2. **Auth middleware + role guard**
   - Access tokens are verified and roles enforced per route (e.g., CUSTOMER-only endpoints).
   - Code: ````16:58:backend/src/middleware/auth.ts````

3. **Query validation with Zod (available courts)**
   - Date/time formats and operating hours are validated before service logic.
   - Code: ````16:45:backend/src/modules/courts/validators/available-courts.validator.ts````

4. **Availability query + overlap logic**
   - Prisma query excludes courts with bookings overlapping the requested window.
   - Code: ````8:16:backend/src/modules/courts/repositories/court.repository.ts````

5. **Service layer with logging + metrics**
   - Service computes duration, logs searches, and records metrics for latency and empty results.
   - Code: ````43:90:backend/src/modules/courts/services/available-courts.service.ts````

6. **Data model for courts/bookings**
   - Courts and bookings use DateTime ranges with indexes for efficient overlap checks.
   - Code: ````26:47:backend/prisma/schema.prisma````

7. **Metrics registry**
   - Prometheus counters/histograms cover auth and available-courts observability.
   - Code: ````43:60:backend/src/shared/metrics.ts````

8. **Seed tooling for local data**
   - Seed script creates sample courts and bookings for test runs.
   - Code: ````8:60:backend/prisma/seed.ts````

## Key Flows

- **Dang ky tai khoan**: `POST /api/auth/register` -> `rateLimitMiddleware` -> `auth.controller.register` -> `auth.service.registerUser` -> `user.repository.createUserWithRelations` -> `res.success`.
- **Dang nhap**: `POST /api/auth/login` -> `rateLimitMiddleware` -> `auth.controller.login` -> `auth.service.loginUser` -> `RefreshToken + LoginAudit` -> `res.success`.
- **Xem san trong**: `GET /api/courts/available` -> `authenticate + requireRole` -> `court.controller.getAvailableCourtsHandler` -> `available-courts.service` -> `court.repository.findAvailableCourts` -> `res.success`.

## Getting Started Tips

- Tao `.env` trong `backend/` theo `docs/setup.md` (JWT keys + DATABASE_URL).
- Chay dev server: `cd backend` -> `npm run dev`.
- Chay migration: `npx prisma migrate dev` (user-run).
- Seed du lieu test: `npm run prisma:seed`.
- Docker local stack: `docker compose -f infra/docker-compose.yml up -d --build`.
- OpenAPI: `docs/api/auth.yaml` va `docs/api/courts.yaml`.

## Important Dependencies

- `express`: HTTP server va routing.
- `prisma` / `@prisma/client`: ORM cho PostgreSQL.
- `jsonwebtoken`: ky/xac minh JWT (RS256).
- `bcryptjs`: hash mat khau va refresh token.
- `zod`: validate payload va query.
- `express-rate-limit`: chong brute-force theo IP.
- `helmet` / `morgan`: security headers va access log.
- `pino`: structured logging.
- `prom-client`: metrics registry, counters, histogram.
- `ts-node` / `typescript`: chay va build TypeScript.
