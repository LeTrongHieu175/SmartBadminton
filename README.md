# SmartBadminton - Local Development Guide

This guide walks you through running the backend API and Flutter frontend locally.

## Prerequisites

- Node.js + npm
- PostgreSQL (local or Docker)
- Flutter SDK (already installed on this machine)

## 1) Backend setup

```bash
cd backend
npm install
```

### Environment variables

Create `backend/.env` with at least:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_badminton
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d

JWT_ACCESS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
JWT_ACCESS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nYOUR_PUBLIC_KEY\n-----END PUBLIC KEY-----"
JWT_REFRESH_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
JWT_REFRESH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nYOUR_PUBLIC_KEY\n-----END PUBLIC KEY-----"
```

Generate dev keys if needed:

```bash
openssl genrsa -out jwt_private.pem 2048
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
```

### Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

(Optional) seed data:

```bash
npm run prisma:seed
```

### Run backend

```bash
npm run dev
```

Backend runs at `http://localhost:3000` by default.

## 2) Frontend (Flutter) setup

```bash
cd frontend
flutter pub get
```

### Run Flutter app

```bash
flutter run
XDG_CONFIG_HOME=/Users/hieutronglee04gmail.com/Documents/HK8/CNM/SmartBadminton/.config flutter run
```

When the login screen appears:
- Use base URL `http://localhost:3000` if running on macOS simulator or desktop.
- Use `http://10.0.2.2:3000` for Android emulator.

## 3) Login flow

The app supports:
- Register
- Login

After login, it calls:
- `GET /api/courts/available` (requires role `CUSTOMER`).

## 4) Run tests (backend)

```bash
cd backend
npx jest --runInBand
```

## Notes

- If Prisma complains about engine mismatch, run `npx prisma generate` again.
- Rate limits are enabled; repeated requests may return 429.
