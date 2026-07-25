# Vaarta

Enterprise-grade, AI-native web conferencing platform.

## Status

- **Phase 1 (frontend foundation):** Landing, auth screens, and dashboard UI are in place with dummy auth/data.
- **Phase 2 (backend):** In progress — microservices built one at a time per the master plan.
- **Phase 3+:** AI agents, analytics, and translation are deferred until earlier phases are complete.

See [`cursor.md`](./cursor.md) for the full build roadmap and session rules. Each backend phase has its own file (`phase-2a-auth-service.md`, etc.).

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Java 17, Spring Boot 3, PostgreSQL, Flyway |
| Infra (local) | Docker Compose |

## Run the frontend locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Repository workflow

- **`main`** — stable, reviewed merges only.
- **Feature branches** — one branch per phase file (e.g. `phase-2a-auth-service`).
- Do not build directly on `main`; see `cursor.md` Section 5.

## Design

UI is based on the [Vaarta design system in Figma](https://www.figma.com/design/bQRApOLkNZQBwuME84BCta/Design-System-for-Vaarta). See [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md) for third-party credits.
