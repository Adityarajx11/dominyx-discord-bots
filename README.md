# Aurex Discord Bots

Aurex is a six-bot Discord platform for Music, Security, Greet, Ping, Ticket, and Level. The repository contains the public landing page and the Discord-authenticated dashboard that manages all six modules from one console.

## Quick start

```bash
npm install
npm start
```

The server listens on port `3000` by default. Copy `.env.example` to `.env` for local development only, and never commit the resulting file.

```bash
npm test
```

Runs the backend test suite against an in-memory Postgres with a mocked Discord API.

## Main routes

- `/` — public Aurex landing page
- `/dashboard.html` — Discord login and bot-management dashboard
- `/api/health` — reports which subsystems are configured
- `/api/modules` — the field contract for the six modules
- `/api/invites` — "Add to Discord" links built from the bot application IDs
- `/api/auth/login` — Discord OAuth entry point
- `/api/guilds` — servers the signed-in user can manage
- `/api/guilds/:id/settings` — module settings, channels, and roles

## How the backend works

The dashboard talks to Discord and Postgres directly from the server. There is no separate management API to deploy.

- **Login** is Discord OAuth2 with the `identify guilds` scope. The access token is stored in an encrypted, HttpOnly cookie and refreshed automatically when it expires.
- **Bot tokens** detect which of the six modules are installed in a server and populate the channel and role dropdowns.
- **Postgres** holds one table per module — `music_settings`, `level_config`, `greet_settings`, `ticket_config`, `ping_settings`, `guard_settings` — so each bot process only ever reads and writes its own configuration.
- **Writes are validated** against a strict field contract, re-check the user's Discord permissions, require a CSRF token, and write an audit entry.

## Project map

The backend runs from the root so Node, Vercel, and Webdev Preview can serve it without extra path configuration. Static assets live in `public/`, which Vercel serves from its CDN. Backend modules live in `lib/` and are never exposed over HTTP.

- [`lib/env.js`](../lib/env.js) — centralised environment access.
- [`lib/schema.js`](../lib/schema.js) — the module settings contract, shared by the dashboard and the bots.
- [`lib/db.js`](../lib/db.js) — Postgres pool and automatic schema setup.
- [`lib/discord.js`](../lib/discord.js) — Discord API client for both user and bot tokens.
- [`lib/settings.js`](../lib/settings.js) — validated reads and writes for module settings.
- [`lib/session.js`](../lib/session.js) — encrypted session cookie and CSRF tokens.
- [`lib/security.js`](../lib/security.js) — origin checks, rate limiting, and audit logging.
- [`lib/invites.js`](../lib/invites.js) — "Add to Discord" links from the application IDs.
- [`server.mjs`](../server.mjs) — HTTP server and Vercel handler.
- [`api/index.mjs`](../api/index.mjs) — Vercel adapter for the server entry point.
- [`public/`](../public) — the landing page, the dashboard shell, and their stylesheets and scripts.

Product and setup documentation is grouped in [`docs/`](./docs):

- [`docs/SETUP_GUIDE.md`](./docs/SETUP_GUIDE.md) — **full setup guide**, from creating the Discord applications to every command and a full music session.
- [`docs/DASHBOARD_SETUP.md`](./docs/DASHBOARD_SETUP.md) — OAuth, Postgres, bot tokens, hosting, and hardening.
- [`docs/MASTER_SESSION_SUMMARY.md`](./docs/MASTER_SESSION_SUMMARY.md) — complete session overview, feature inventory, and validation.

## Important security note

Do not place Discord client secrets, bot tokens, session secrets, or `DATABASE_URL` in browser code, GitHub, or chat. Configure them through the deployment provider's encrypted secret manager.
