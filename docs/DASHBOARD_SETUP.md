# Dominyx Dashboard setup

The dashboard uses Discord OAuth2 for login and keeps the Discord access token in an encrypted, HttpOnly server cookie. It limits users to servers where Discord reports Administrator or Manage Server permission. Bot tokens and database credentials remain server-only and are never sent to browser JavaScript.

## Current implementation

The dashboard shell, authentication routes, guild selector, six-module settings UI, secure session handling, and server-side settings proxy are implemented. The proxy is intentionally a small adapter boundary so the Railway service or direct Postgres adapter can be connected without changing the UI.

Before real login works, configure the protected values through the hosting secret manager. Never commit a `.env` file or paste token values into chat.

## Old-project-compatible environment shape

The supplied Dominyx Network repository uses these server-side values:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `PUBLIC_APP_URL`
- `DATABASE_URL` — the shared Railway Postgres URL
- `BOT_TOKEN` — the general server-side Discord bot token used for guild reads
- `BOT_TOKEN_MUSIC`
- `BOT_TOKEN_LEVEL`
- `BOT_TOKEN_GREET`
- `BOT_TOKEN_TICKET`
- `BOT_TOKEN_PING`
- `BOT_TOKEN_GUARD`
- `BOT_ID_MUSIC`, `BOT_ID_LEVEL`, `BOT_ID_GREET`, `BOT_ID_TICKET`, `BOT_ID_PING`, `BOT_ID_GUARD`
- `DOMINYX_SESSION_SECRET` — the current project’s encrypted-session secret

The old HQ implementation talks to Discord and the shared Postgres database from the server. It does not expose these values to the browser and does not require a separate Railway management API key.

## Discord OAuth callback

Set the exact callback URL in both the hosting environment and the Discord Developer Portal:

```text
https://your-domain.example/api/auth/callback
```

For local development, use the local server URL instead. The callback must match exactly, including protocol, hostname, port, and path.

## Security module scope

The Security dashboard uses the old Guard-compatible concepts: mod-log routing; spam, link, caps, mention, emoji, bad-word, and scam-link filters; anti-raid joins; account-age gates; anti-nuke alerts and rollback; automod mute roles; warning escalation; and join-to-get roles.

The old project’s documented gaps are not treated as desired behavior. Add runtime permission re-checks, rate limits, role-hierarchy checks, per-action CSRF/origin protection, and audit logging before exposing destructive controls publicly.

## Sources

- [Dominyx Network repository](https://github.com/Adityarajx11/Dominyx-Network)
- [Dominyx HQ live site](https://dominyx.vercel.app)
