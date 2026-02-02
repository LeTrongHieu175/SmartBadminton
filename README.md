# SmartBadminton - Local Development Guide

This guide walks you through running the backend API and Flutter frontend locally, with API base URL configured via `--dart-define`.

## Prerequisites

- Node.js + npm
- PostgreSQL (local or Docker)
- Flutter SDK

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

### Configure API base URL (recommended)

We use `--dart-define` so each machine can supply its own backend URL without editing code.

Examples:

- macOS desktop or iOS simulator (backend on the same machine):

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

- Android emulator (backend on the same machine):

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

- Physical device or different machine (replace with your backend IP):

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000
```

Notes:
- Use your machine’s LAN IP if running backend on another computer.
- Ensure the backend machine allows incoming connections on port 3000.
- If you change networks or IPs, just re-run `flutter run` with the new URL.

### Run Flutter app

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

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
