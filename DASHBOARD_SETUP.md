# Dominyx Dashboard setup

The dashboard uses Discord OAuth2 for login and keeps the Discord access token in an encrypted, HttpOnly server cookie. It never sends the client secret or Railway API key to the browser. Users are limited to guilds where their Discord permissions include Administrator or Manage Server.

## Required protected values

Set these through the Webdev secret card or the hosting provider's server-only environment settings:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DOMINYX_SESSION_SECRET`
- `RAILWAY_BOT_API_URL`
- `RAILWAY_BOT_API_KEY`

Set `DOMINYX_PUBLIC_URL` and `DISCORD_REDIRECT_URI` to the final public domain. Add the exact callback URL to the Discord application's OAuth2 Redirects list.

## Railway adapter contract

The dashboard calls:

```text
GET  {RAILWAY_BOT_API_URL}/guilds/:guildId/settings
PUT  {RAILWAY_BOT_API_URL}/guilds/:guildId/settings
```

Each request includes `Authorization: Bearer {RAILWAY_BOT_API_KEY}`, `X-Discord-User-Id`, and `X-Discord-Guild-Id`. The PUT body is JSON and can be mapped by the Railway service to the existing Postgres schema. The GET response can be either the settings object directly or `{ "settings": { ... } }`.

The adapter intentionally keeps Railway/Postgres schema decisions in the bot service, so the public website does not need database credentials or direct Postgres access.

## Security reference scope

The Security module uses only the command-defense concepts from the supplied [Dominyx Network repository](https://github.com/Adityarajx11/Dominyx-Network) and its public [Dominyx HQ site](https://dominyx.vercel.app): command protection, mod-log routing, spam/link/caps/mention/emoji/word filters, scam-link detection, anti-raid join bursts, account-age gates, anti-nuke alerts/rollback, mute roles, and warning escalation. The old branding, page layout, unrelated copy, and full repository are not being copied into this project.

The settings names intentionally match the old `guard_settings` fields where possible, so the Railway service can map them to the existing Postgres-backed Guard implementation. The old repository’s documented gaps—such as missing runtime permission re-checks, missing rate limits, and incomplete role-hierarchy checks—should be treated as hardening work rather than copied behavior.
