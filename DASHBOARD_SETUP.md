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
