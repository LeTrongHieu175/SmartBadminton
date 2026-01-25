# SmartBadminton Project Overview

## Project Structure

```
.
├─ backend/
│  ├─ prisma/
│  │  └─ schema.prisma           # Prisma schema (User, RefreshToken, LoginAudit)
│  ├─ src/
│  │  ├─ app.ts                  # Express bootstrap
│  │  ├─ config/                 # env loader + validation
│  │  ├─ middleware/             # rate limiting
│  │  ├─ modules/
│  │  │  └─ auth/                # controllers/services/repositories/validators
│  │  ├─ routes/                 # HTTP routers
│  │  └─ shared/                 # jwt, prisma client, response helpers, logs, metrics
│  └─ tests/                     # unit + integration + contract tests
├─ docs/
│  ├─ api/                       # OpenAPI specs
│  ├─ ops.md                     # operations/security notes
│  └─ setup.md                   # env setup
├─ infra/
│  ├─ docker-compose.yml         # local stack
│  └─ Docker/                    # backend Dockerfile
├─ task/                         # task checklists
└─ TDD/                          # technical design docs
```

## Key Patterns & Concepts

1. **Express bootstrap va response wrapper**
   - Khi app khoi dong, middleware bao gom `helmet`, `morgan`, JSON parser, va `responseMiddleware` de chuan hoa response.
   - Ma tham chieu: ````1:21:backend/src/app.ts````
   - Ma tham chieu: ````1:51:backend/src/shared/response.ts````

2. **Routing theo module va layering ro rang**
   - Router dinh nghia duong dan, gan `rateLimitMiddleware`, roi goi controller.
   - Ma tham chieu: ````1:9:backend/src/routes/auth.routes.ts````
   - Ma tham chieu: ````7:42:backend/src/modules/auth/controllers/auth.controller.ts````

3. **Validation payload bang Zod**
   - Quy tac username/phone/email va role duoc dong bo qua schema.
   - Ma tham chieu: ````1:36:backend/src/modules/auth/validators/register.validator.ts````

4. **Auth service quan ly dang ky va tao token**
   - Kiem tra trung lap, hash mat khau, ky JWT, hash refresh token va ghi audit.
   - Ma tham chieu: ````1:172:backend/src/modules/auth/services/auth.service.ts````

5. **Repository va transaction cho user + refresh token + audit**
   - Tao user, refresh token va login audit trong mot transaction.
   - Ma tham chieu: ````1:47:backend/src/modules/auth/repositories/user.repository.ts````

6. **JWT ky/xac minh RS256**
   - Doc khoa tu env/Base64, ky token voi issuer co dinh va thoi han TTL.
   - Ma tham chieu: ````1:85:backend/src/shared/jwt.ts````

7. **Cau hinh env bat buoc**
   - Validate cac bien bat buoc va ep kieu cho config (port, rate limit, bcrypt).
   - Ma tham chieu: ````1:111:backend/src/config/env.ts````

8. **Rate limit theo IP**
   - Gioi han so request tren cua so thoi gian va tra loi chuan hoa.
   - Ma tham chieu: ````1:28:backend/src/middleware/rateLimit.ts````

9. **Logging va metrics**
   - Pino logger cho moi truong dev/prod; counters/histogram cho registration.
   - Ma tham chieu: ````1:20:backend/src/shared/logger.ts````
   - Ma tham chieu: ````1:25:backend/src/shared/metrics.ts````

10. **Testing theo 3 lop**
   - Unit test cho service, integration test cho route, contract test voi OpenAPI.
   - Ma tham chieu: ````1:86:backend/tests/modules/auth/auth.service.test.ts````
   - Ma tham chieu: ````1:147:backend/tests/integration/register.integration.test.ts````
   - Ma tham chieu: ````1:62:backend/tests/integration/register.contract.test.ts````

## Key Flows

- **Dang ky tai khoan**: `POST /api/auth/register` -> `rateLimitMiddleware` -> `auth.controller.register` -> `auth.service.registerUser` -> `user.repository.createUserWithRelations` -> `res.success`.
- **Cap token**: `signAccessToken/signRefreshToken` -> `hashPassword` refresh token -> luu `RefreshToken` trong DB.
- **Validate + error handling**: `registerSchema.parse` -> `ServiceError/ZodError` -> `res.fail` voi code va message.

## Getting Started Tips

- Tao `.env` trong `backend/` theo `docs/setup.md` va cung cap day du JWT keys.
- Chay dev server: `cd backend` -> `npm run dev`.
- Dung Docker Compose o `infra/docker-compose.yml` neu can Postgres local.
- Khi deploy sau reverse proxy, dam bao `X-Forwarded-For` de rate limit theo IP.
- OpenAPI cho auth o `docs/api/auth.yaml` de doi chieu hop dong API.

## Important Dependencies

- `express`: HTTP server va routing.
- `prisma` / `@prisma/client`: ORM cho PostgreSQL.
- `jsonwebtoken`: ky/xac minh JWT (RS256).
- `bcryptjs`: hash mat khau va refresh token.
- `zod`: validate payload.
- `express-rate-limit`: chong brute-force theo IP.
- `helmet` / `morgan`: security headers va access log.
- `pino`: structured logging.
- `prom-client`: metrics registry, counters, histogram.
