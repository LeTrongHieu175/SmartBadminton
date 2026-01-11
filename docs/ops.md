# Operations & Security Notes

## HTTPS / Production Deployment
- All API traffic must be terminated over HTTPS. Configure your reverse proxy (NGINX/Traefik) to enforce TLS 1.2+ and forward X-Forwarded-Proto so Express can detect secure requests.
- When running behind a proxy, set pp.set('trust proxy', true) in the Express bootstrap so 
eq.ip and rate limiting work correctly.
- Certificates should be stored in your secret manager or injected via the deployment platform. Do **not** commit them to the repo.

## Logging / PII Masking
- Pino logger is configured to log structured events only. Avoid logging raw request bodies or secrets.
- When logging identifiers, prefer masked values (e.g., last 4 digits of phone). The current registration flow only logs username, userId, and high-level error codes.
- Audit entries (login_audit table) already store IP/User-Agent; avoid storing plaintext passwords or tokens.

## Refresh Token Storage
- Refresh tokens are hashed with bcrypt before being stored; never persist plaintext tokens.
- Rotate RSA keys periodically and update .env secrets accordingly.

Keep this document updated as new operational requirements are introduced.
