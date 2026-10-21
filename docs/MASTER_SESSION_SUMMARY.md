# Aurex master session summary

**Project:** Aurex Discord Bots

**Repository:** https://github.com/adixlucifer0011/aurex-discord-bots

**Current checkpoint:** the latest clean `main` commit in GitHub; this summary is kept in sync with the packaged tree

**Working directory:** `/home/ubuntu/aurex`

**Date:** 2026-10-19

## Product direction

Aurex is a Discord bot network and control surface for six focused bots: Music, Security, Greet, Ping, Ticket, and Level. The public site is a premium neutral black, white, and gray landing page with the restored moving motion background, recolored for Aurex, dot-matrix display typography, Inter interface typography, a compact pill navigation, responsive mobile navigation, and a scrollable product story.

The dashboard is a separate authenticated control surface. It is intentionally more operational than the marketing site, but it uses the same black, white, gray, glass, orbital, and dot-matrix visual language.

## Public website delivered

- Full-screen hero with the original moving motion background restored and recolored into a neutral black, white, and gray treatment, with a dark veil and red grid texture for readability.
- Visible recolored motion background with layered black veil and red grid texture for legibility.
- Aurex circular wordmark and centered desktop navigation.
- Responsive mobile hamburger navigation with overlay sheet.
- Discord-focused hero copy and login CTA.
- Dedicated module slide with six selectable bot rows and a detail panel.
- Dynamic module copy, tags, metrics, and Greet quote formatting.
- Full bot-suite cards for Music, Security, Greet, Ping, Ticket, and Level.
- Per-bot Add to Discord placeholder links controlled from one map in `main.js`.
- Why Aurex principles section.
- Connection CTA and footer.
- Smooth anchor navigation.
- Reduced-motion handling, including pausing the video and avoiding animated counters where appropriate.
- Footer proof row changed from unsupported `24 ms` and `99.99% uptime` claims to stable product descriptors: six modules, one console, scalable paths, and Discord-native operation.

## Dashboard delivered

- `/dashboard.html` login gate.
- Discord OAuth login and logout routes.
- Encrypted server-side session cookie.
- Manageable-server selector based on Administrator or Manage Server permission.
- Six dashboard module tabs.
- Server connection status and logged-in user state.
- Settings form renderer with safe HTML escaping for untrusted server/settings labels.
- Server-side save proxy boundary for Railway or direct bot/Postgres integration.
- Mobile-responsive dashboard styling using the Aurex visual system.
- Friendly setup messaging when protected OAuth configuration is missing.

## Exact bot-management scope

### Music

The dashboard model covers 24/7 mode, default volume, queue size, DJ role, announcement channel, empty-queue leave timeout, prefix, music XP, XP cooldown, reward tiers, and fan/usage statistics.

### Level

The dashboard model covers announcement channel, XP range, XP cooldown, level-up message templates, role stacking, level-to-role rewards, ignored channels, and ignored roles.

### Greet

The dashboard model covers welcome and goodbye channels, welcome and goodbye copy, auto-role, welcome cards, card theme, DM welcomes, and greeting bot members.

### Ticket

The dashboard model covers category channel, staff role, log channel, maximum tickets per member, inactive close time, banner URL, panel title, panel rules, DM-on-close, and ticket categories.

### Ping

The dashboard model covers YouTube channel, alert channel, enable state, alert copy, mention role, and polling interval.

### Security / Guard

The dashboard model covers mod-log channel, spam/link/caps/mention/emoji/bad-word/scam filters, anti-raid joins, raid action and cooldown, account-age gate, anti-nuke state, nuke action, deletion rollback, mute role, warning thresholds, and join-to-get role categories.

## Old project reference used

The supplied repository and live site were inspected as references:

- https://github.com/Adityarajx11/Aurex-Network
- https://aurex.vercel.app

Only the relevant command-defense and dashboard-setting concepts were used. The old branding, page copy, unrelated UI, and entire old repository were not copied.

The old project’s useful security concepts are anti-raid, anti-nuke, rollback, mod logs, automod filters, scam-link deletion, account-age gating, warning escalation, and join-to-get roles.

The old project also documents gaps that should not be reproduced: missing runtime permission checks, missing rate limits, incomplete hierarchy checks, missing action audit logs, and incomplete CSRF/origin hardening.

## Environment and security

Never commit or paste live secrets into chat. The server-side variables are the Discord OAuth values, the shared Railway `DATABASE_URL`, one general bot token, six bot tokens, six bot application IDs, the public app URL, the redirect URL, and a session secret.

The direct Discord/Postgres adapter is now implemented. The dashboard reads and writes the shared Postgres tables directly, using the six per-module bot tokens for guild, channel, and role reads.

## Hardening added with the direct adapter

- Encrypted AES-256-GCM session cookie holding the Discord access and refresh tokens, with automatic refresh before expiry.
- CSRF protection: a per-session token returned by `/api/auth/me` and required in the `x-aurex-csrf` header on every write, combined with an `Origin` check against the deployment origin.
- Permission re-checks on every request using the signed-in user's own Discord token rather than a cached flag.
- Strict per-field validation with ranges, enums, and length limits; unknown fields are ignored rather than written.
- Rate limiting on login and settings writes.
- Audit trail in `dashboard_audit_log` recording the user, guild, module, and exact before/after values for every save.
- Static file allowlist so `lib/`, `.env`, and every other path return 404.

## Project files

- `index.html` — public Aurex landing page.
- `styles.css` — public design system, video treatment, responsive layouts, modules console, suite cards, and animations.
- `main.js` — public module interaction, OAuth placeholder map, smooth scroll, auth CTA state, video start behavior, and reduced-motion handling.
- `dashboard.html` — authenticated dashboard shell.
- `dashboard.css` — dashboard design system.
- `dashboard.js` — dashboard auth state, guild selection, six module definitions, forms, and settings save behavior.
- `server.mjs` — Node server, OAuth routes, encrypted sessions, auth gates, and settings routes.
- `api/index.mjs` — Vercel adapter for the server entry point.
- `lib/env.js` — centralised environment access.
- `lib/schema.js` — the module settings contract shared by the dashboard and the bots.
- `lib/db.js` — Postgres pool and automatic schema setup.
- `lib/discord.js` — Discord API client for user and bot tokens.
- `lib/settings.js` — validated module settings reads and writes.
- `lib/session.js` — encrypted session cookie, CSRF tokens, and cookie parsing.
- `lib/security.js` — origin checks, rate limiting, and audit logging.
- `lib/invites.js` — "Add to Discord" links built from the bot application IDs.
- `package.json` — Node 20+ scripts and the `pg` dependency.
- `vercel.json` — Vercel routing configuration.
- `.env.example` — non-secret environment template.
- `manus-routes.json` — declared `/` and `/dashboard.html` routes.
- `app.config.ts` — project logo metadata.
- `TODO.md` — delivery criteria and acceptance clauses.
- `test/` — backend test suite using an in-memory Postgres and a mocked Discord API.
- `docs/DASHBOARD_SETUP.md` — dashboard setup and environment guide.
- `docs/MASTER_SESSION_SUMMARY.md` — this complete session overview.

## Validation completed

- JavaScript syntax checked with `node --check`.
- Route manifest checked as JSON.
- HTTP smoke tests run against the local Preview server.
- Backend test suite: 25 tests covering the database contract, validation rules, the full login to save flow, the invite links, and the CSRF and origin rejections.
- Dashboard rendered in a browser against a mocked API for all six modules — 68 fields, correct field types, populated channel and role dropdowns, and no console errors.
- Git whitespace checks run with `git diff --check`.
- Desktop and mobile screenshots captured for the public site.
- Dashboard browser-only authenticated mock preview captured without bypassing production auth.
- Public GitHub synchronization completed after every major implementation change.

## Commit history highlights

- `943d825` — expanded the Aurex full bot-suite site.
- `98d4152` — moved the module console into a dedicated slide.
- `abbeb60` — added Greet quote formatting.
- `4d86c32` — changed the accent palette to electric lavender.
- `f80b681` — added the Discord-authenticated dashboard foundation.
- `7f13005` — added dashboard setup guidance.
- `fcacd21` — mapped old Guard command defenses into the Security module.
- `7c22714` — redesigned the module console as a split module rail/detail panel.
- `fd8a969` — restored and refined translucent module styles.
- `a68e4bc` — darkened module cards to match the suite cards.

## Remaining work

1. Enter the protected Discord OAuth, Postgres, bot-token, application-ID, public URL, redirect URL, and session-secret values through secure hosting configuration.
2. Confirm the production host and exact Discord OAuth callback URL. Railway only allows custom domains on the Hobby plan or the 30-day free trial, so Vercel is the free option.
3. Point the new bot processes at the same `DATABASE_URL` and read their configuration from the per-module tables described in `lib/schema.js`.
4. Set the six `BOT_ID_*` application IDs so the "Add to Discord" buttons point at the real bots. The links are generated server-side from `/api/invites`.
