## Environment Variables

Create a `.env` file in `backend/` (copy from `.env.example` when available) and provide the following values:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma. |
| `PORT` | No (default `3000`) | Port the backend server listens on. |
| `NODE_ENV` | No (default `development`) | Runtime environment. |
| `LOG_LEVEL` | No (default `info`) | Pino/Winston log level. |
| `JWT_ACCESS_PRIVATE_KEY` | Yes | Base64/PEM private key for RS256 access tokens. |
| `JWT_ACCESS_PUBLIC_KEY` | Yes | Public key for verifying access tokens. |
| `JWT_REFRESH_PRIVATE_KEY` | Yes | Private key for RS256 refresh tokens. |
| `JWT_REFRESH_PUBLIC_KEY` | Yes | Public key for refresh token verification. |
| `ACCESS_TOKEN_TTL` | No (default `15m`) | Access token lifetime (ms, s, m). |
| `REFRESH_TOKEN_TTL` | No (default `30d`) | Refresh token lifetime. |
| `BCRYPT_SALT_ROUNDS` | No (default `12`) | Bcrypt cost factor for password hashing. |
| `RATE_LIMIT_WINDOW_MS` | No (default `900000`) | Window length for rate limiter in milliseconds. |
| `RATE_LIMIT_MAX` | No (default `5`) | Max requests per window per IP for registration endpoint. |
| `RATE_LIMIT_STORE` | No (`memory`/`redis`) | Choose `redis` in production to share counters. |

> **Note:** Do not commit `.env` files. An `.env.example` template should contain non-secret placeholders.

Ensure `.env`, `*.pem`, and other secret files are listed in `.gitignore`. Current root `.gitignore` already ignores `.env`. If additional secret paths are introduced (e.g., `backend/keys/`), add them here before committing.
