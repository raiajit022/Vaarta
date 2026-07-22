# Phase 2e — Admin Dashboard (role-based, not a new microservice)

> Prerequisite: `phase-2a`, `phase-2b`, `phase-2c` done. Build ONLY this in this session.

> **Before anything else: create branch `phase-2e-admin-dashboard` from `main` and switch to it (see cursor.md Section 5). Do not write code on `main`.**

## Goal
Admin-only views (user management, meeting oversight) using the `role` column already present in `auth-service`'s `users` table (`USER` / `ADMIN`) — no separate microservice needed at this stage; this is a role-gated layer on top of existing services.

## Step 0 — Analyze Before Building

Before writing code: check whether any admin-related routes, nav links, or placeholder pages already exist anywhere in the frontend (even unlinked/unused ones from Figma exports), and check the current shape of the auth store (populated in Phase 2a) to confirm `role` is available client-side. Summarize findings, then build on top of what's there rather than assuming a blank slate.

## Approach
- **Backend**: add role-checked endpoints to existing services (`auth-service`, `user-service`, `meeting-service`) rather than building a new `admin-service`. A `@PreAuthorize("hasRole('ADMIN')")`-style guard (or manual role check in the JWT filter) protects these.
- **Frontend**: a protected route group (e.g. `/admin/*`) that checks `role === 'ADMIN'` from the auth store before rendering, redirecting non-admins away.

## New/Extended Endpoints

**auth-service**
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/users` | list all users (paginated), admin only |
| PUT | `/api/admin/users/{id}/role` | promote/demote a user's role |
| PUT | `/api/admin/users/{id}/disable` | disable an account |

**meeting-service**
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/meetings` | list all meetings across all users (paginated), admin only |
| POST | `/api/admin/meetings/{id}/force-end` | admin can force-end a live meeting |

## Frontend Structure

```
src/
  routes/
    admin/
      AdminLayout.tsx          // role-gate wrapper, redirects non-admins
      AdminUsersPage.tsx       // table of users, role/disable actions
      AdminMeetingsPage.tsx    // table of meetings, force-end action
```

- Reuse existing design system components (tables, badges for role/status) — do not introduce new styling patterns for admin.
- Route guard logic: check `user.role` from the Zustand auth store (populated from `GET /api/auth/me`), not a separate admin login.

## How you become the first admin
Since there's no self-serve "become admin" flow (correctly, for security), the very first admin user is set manually:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```
Run this once, directly against the `auth` database, after registering your own account normally.

## Definition of Done
- Logging in as a normal user cannot see or reach `/admin/*` routes (redirected).
- Logging in as an admin (manually promoted) can view all users and all meetings, and can disable a user or force-end a meeting.

## Explicitly NOT in this session
- A separate `admin-service` microservice — only introduce this later if admin functionality grows significantly (e.g. audit logs, billing admin, etc.).
- LiveKit, agents.
