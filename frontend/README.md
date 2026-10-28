# EventBuddy Frontend

Next.js 16 App Router frontend for EventBuddy.

## Run locally

Install frontend packages and start the full application from the repository root:

```powershell
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the Nest API at `http://localhost:4000`.

For an API hosted at a different URL, set `NEXT_PUBLIC_EVENTBUDDY_API_URL` in the frontend environment (for example, `http://localhost:4000`). The backend `FRONTEND_URL` must match the browser origin, and requests use credentialed HttpOnly session cookies.

The backend database must be configured and migrated before registration, profile, groups, matches, notifications, or admin features can persist data. Follow `backend/README.md` for PostgreSQL and Prisma setup.

## Checks

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Main routes

- `/`: event discovery landing page.
- `/events`: searchable and filterable events.
- `/events/[id]`: event details and attendance action.
- `/login` and `/register`: student authentication.
- `/dashboard`: student summary.
- `/dashboard/groups` and `/groups/[id]`: groups and group discussion.
- `/dashboard/matches`: interest-based matches and connection requests.
- `/dashboard/notifications`: personal alerts.
- `/profile`: editable profile.
- `/admin`: protected management pages for events, colleges, users, and counts.