# Dominyx Discord Bots

Dominyx is a six-bot Discord platform for Music, Security, Greet, Ping, Ticket, and Level. The repository contains the public landing page, the Discord-authenticated dashboard shell, and the server-side adapter boundary for connecting the dashboard to the existing bot/Postgres system.

## Quick start

```bash
npm install
npm run dev
```

The server listens on port `3000` by default. Copy `.env.example` to `.env` only for local development, and never commit the resulting file.

## Main routes

- `/` — public Dominyx landing page
- `/dashboard.html` — Discord login and bot-management dashboard
- `/api/health` — server health response
- `/api/auth/login` — Discord OAuth entry point

## Project map

The runtime files stay at the root so Node, Vercel, and Webdev Preview can serve them without extra path configuration. Product and setup documentation is grouped in [`docs/`](docs/):

- [`docs/MASTER_SESSION_SUMMARY.md`](docs/MASTER_SESSION_SUMMARY.md) — complete session overview, feature inventory, security scope, commits, validation, and remaining work.
- [`docs/DASHBOARD_SETUP.md`](docs/DASHBOARD_SETUP.md) — OAuth, Postgres, bot-token, callback, and hardening setup.
- [`TODO.md`](TODO.md) — delivery criteria and acceptance clauses.

## Important security note

Do not place Discord client secrets, bot tokens, session secrets, or `DATABASE_URL` in browser code, GitHub, or chat. Configure them through the deployment provider’s encrypted secret manager.
