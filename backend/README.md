# EventBuddy Backend

NestJS API, Prisma ORM, and PostgreSQL database for EventBuddy.

## Requirements

- Node.js 22.22.3 or newer in the Node 22 line (the Nest 12 toolchain requires this), or a supported newer LTS release.
- PostgreSQL 14 or newer.
- npm.

## Local setup

From the repository root, install backend dependencies:

```powershell
npm ci --prefix backend --legacy-peer-deps
```

Copy `backend/.env.example` to `backend/.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string.
- `PORT`: API port, default 4000.
- `FRONTEND_URL`: allowed frontend origin, default `http://localhost:3000`.
- `JWT_SECRET`: random secret of at least 32 characters. Use a strong value in every environment; production refuses to start without it.
- `SEED_STUDENT_PASSWORD`: optional private password of at least 12 characters. When set, the seed creates/updates a demo student and related sample records; when omitted, no student account is created.
- `SEED_ADMIN_EMAIL`: optional registered account to promote to admin. `SEED_ADMIN_PASSWORD` is needed only to create a new admin account and must be at least 16 characters.

Do not commit `.env` or share its secrets.

Apply the tracked migrations to the configured database, then generate Prisma Client and seed sample records:

```powershell
Push-Location backend
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
Pop-Location
```

The seed script creates an admin only if both admin email and password are explicitly configured. A demo student and its related sample records are created only when `SEED_STUDENT_PASSWORD` is explicitly configured.

To grant your existing account admin access, set `SEED_ADMIN_EMAIL` to the exact registered email in `backend/.env`, then run `npm --prefix backend run prisma:seed`. This promotes the account without changing its password. `SEED_ADMIN_PASSWORD` is required only if that email does not already have an account. Do not paste passwords into chat. Then sign in through `/login` and open `/admin`.

## Run

Run both apps from the repository root:

```powershell
npm run dev
```

Or run the API by itself:

```powershell
npm --prefix backend run start:dev
```

Health endpoint: `http://localhost:4000/health`.

## Checks

```powershell
npm --prefix backend run build
npm --prefix backend run test
npm --prefix backend run test:e2e
npm --prefix backend run lint
```

## Current scope

Implemented API areas include student registration/login/logout, session-scoped dashboard/profile updates, searchable events and attendance, HTTPS organizer registration links, group membership and messages, interest matches and accept/decline connection requests, user notifications, and protected admin event/college/user-status endpoints. Admin analytics currently includes event detail view counts and entity totals.

The database migrations are intentionally separate from the seed. Four migrations are currently tracked: initial schema, group messages, connection requests, and account status/event registration/view analytics. `prisma migrate deploy` changes the database identified by `DATABASE_URL`; verify that target before running it. After approval, run the migration and seed commands above.

Known product gaps: department/year are not represented in the user schema; registration does not yet select/associate a college; event views are counted per browser tab session and need abuse/rate controls for production; connection requests have no email/push notifications; group messaging is request/refresh based rather than real-time; there is no password reset/email verification or comprehensive CSRF/rate-limiting policy. Review these before public production deployment.