# QuickCourt Backend Template

Stack: Express + TypeScript + JWT + OTP (Email/SMS/WhatsApp) + Prisma + PostgreSQL.

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install`.
3. Generate Prisma Client: `npm run prisma:generate`.
4. Run migrations: `npm run prisma:migrate`.
5. Start dev server: `npm run dev`.

## OTP Flow
- Request OTP: `POST /auth/otp/request` with `{ email, channel: 'EMAIL'|'SMS'|'WHATSAPP', phone?, whatsapp? }`.
- Verify OTP: `POST /auth/otp/verify` with `{ email, code, channel }`.

## Auth Flow
- Register: `POST /auth/register` `{ email, password, phone? }`.
- Login: `POST /auth/login` returns `{ accessToken, refreshToken }`.
- Refresh: `POST /auth/token/refresh` `{ refreshToken }`.

Add protected routes using `requireAuth` middleware.
