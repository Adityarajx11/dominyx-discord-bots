# Dominyx Dashboard setup

The dashboard uses Discord OAuth2 for login and keeps the Discord access token in an encrypted, HttpOnly server cookie. It limits users to servers where Discord reports Administrator or Manage Server permission. Bot tokens and database credentials remain server-only and are never sent to browser JavaScript.

## What the backend does

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Reports which subsystems are configured. Never returns secret values. |
| `/api/modules` | GET | Returns the field contract (types, ranges, options) for the six modules. |
| `/api/invites` | GET | Builds the "Add to Discord" links from the bot application IDs. |
| `/api/auth/login` | GET | Starts the Discord OAuth2 flow with a `state` cookie. |
| `/api/auth/callback` | GET | Exchanges the code, sets the encrypted session cookie. |
| `/api/auth/me` | GET | Returns the signed-in user and the CSRF token. |
| `/api/auth/logout` | GET | Clears the session cookie. |
| `/api/guilds` | GET | Lists servers the user can manage, plus which Dominyx modules are installed. |
| `/api/guilds/:id/settings` | GET | Loads module settings, the guild, its channels, and its roles. |
| `/api/guilds/:id/settings` | PUT | Validates and saves one module's settings, then writes an audit entry. |

The bot tokens are used to detect which modules are installed in a server and to populate the channel and role dropdowns. The database is read and written directly — there is no separate management API to deploy.

## Environment variables

Set these in your host's encrypted secret manager. Never commit a `.env` file, and never paste token values into chat or an issue.

```
DISCORD_CLIENT_ID        Discord application (client) ID
DISCORD_CLIENT_SECRET    Discord application client secret
DISCORD_REDIRECT_URI     https://your-domain.example/api/auth/callback
DOMINYX_PUBLIC_URL       https://your-domain.example
DOMINYX_SESSION_SECRET   32+ random characters
DATABASE_URL             Postgres connection string shared with the bots
BOT_TOKEN                General bot token for guild/channel/role reads
BOT_TOKEN_MUSIC          Per-module bot tokens
BOT_TOKEN_LEVEL
BOT_TOKEN_GREET
BOT_TOKEN_TICKET
BOT_TOKEN_PING
BOT_TOKEN_GUARD
BOT_ID_MUSIC             Per-module application IDs, used for "Add to Discord" links
BOT_ID_LEVEL
BOT_ID_GREET
BOT_ID_TICKET
BOT_ID_PING
BOT_ID_GUARD
PORT                     Defaults to 3000
NODE_ENV                 Set to production
PG_POOL_MAX              Defaults to 1 on Vercel, 5 elsewhere
```

Generate the session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Discord application setup

1. Create an application at <https://discord.com/developers/applications>.
2. Under **OAuth2 → Redirects**, add exactly `https://your-domain.example/api/auth/callback`.
3. The redirect URI must match `DISCORD_REDIRECT_URI` character for character, including protocol, hostname, port, and path.
4. The scopes requested are `identify guilds`, which is enough to show the server list and permission flags.

## Database contract

Each module owns one table so a bot process never writes to another bot's configuration:

| Module | Table |
| --- | --- |
| Music | `music_settings` |
| Level | `level_config` |
| Greet | `greet_settings` |
| Ticket | `ticket_config` |
| Ping | `ping_settings` |
| Security | `guard_settings` |

Every table has a `guild_id` primary key, an `enabled` boolean, and `created_at` / `updated_at` timestamps. The dashboard creates the tables and columns automatically on first request, and adding a column later is also handled — so the bots only need to read the columns they care about.

The full field list, types, and validation ranges live in [`lib/schema.js`](../lib/schema.js). That file is the single source of truth shared by the dashboard and the bots.

## Add to Discord links

The six "Add to Discord" buttons on the landing page are built server-side from the `BOT_ID_*` application IDs and served from `/api/invites`. Application IDs are public values — they appear in every invite link — so serving them from the API is safe, and it keeps them out of the HTML.

Set `BOT_ID_MUSIC`, `BOT_ID_LEVEL`, `BOT_ID_GREET`, `BOT_ID_TICKET`, `BOT_ID_PING`, and `BOT_ID_GUARD`, and each button links straight to the right authorization prompt. A module without an application ID is skipped, and its button keeps its existing fallback behaviour.

Each module requests only the permissions it needs. The permission sets live in [`lib/invites.js`](../lib/invites.js).

## Hosting

### Vercel (recommended for a free custom domain)

Railway's permanent free plan does not allow custom domains. Vercel's Hobby plan attaches your own domain for free, and also gives you a free `*.vercel.app` subdomain.

1. Import the repository into Vercel.
2. Add every environment variable under **Settings → Environment Variables**.
3. Deploy. `vercel.json` already routes `/api/*` to the serverless entry point.

On Vercel keep `PG_POOL_MAX=1`. The serverless runtime freezes the filesystem and reuses a single connection.

### Railway

Railway gives you a custom domain on the Hobby plan ($5/month) and on the 30-day free trial, but not on the permanent free plan.

1. `railway init` in the repository, then `railway up`.
2. Add the environment variables with `railway variables --set "KEY=value"`.
3. `railway domain` to attach the custom domain.

Set `PG_POOL_MAX=5` or higher on Railway, since the process stays alive between requests.

### Any Node host

```bash
npm install
npm start
```

The server listens on `PORT` (default `3000`) and binds to `0.0.0.0`.

## Security model

- **Secrets stay server-side.** Discord client secrets, bot tokens, and `DATABASE_URL` are never sent to the browser. The public site and the dashboard fetch only field metadata.
- **Encrypted session.** The session cookie holds the Discord access token encrypted with AES-256-GCM using `DOMINYX_SESSION_SECRET`, with the key derived via SHA-256. The cookie is `HttpOnly`, `SameSite=None` in production, and `Secure` in production.
- **Token refresh.** Discord access tokens expire. The session stores the refresh token and expiry, and the server refreshes automatically without logging the user out.
- **CSRF protection.** Every write requires an `x-dominyx-csrf` header matching the CSRF token embedded in the encrypted session, and the `Origin` header must match the deployment origin.
- **Permission re-checks.** Guild access is verified against Discord on every request using the signed-in user's own token — not a cached flag.
- **Strict validation.** Every value is checked against the field contract before it reaches the database. Unknown fields are ignored rather than written, and out-of-range values are rejected with a per-field error.
- **Audit trail.** Each successful save writes a row to `dashboard_audit_log` with the user, guild, module, and the exact before/after values.
- **Rate limiting.** Login and settings writes are rate limited per IP.
- **Static file allowlist.** Only the public HTML, CSS, and JS files are served. `lib/`, `.env`, and every other path return 404.

## Testing

```bash
npm test
```

The suite covers the database contract, validation rules, and the full HTTP flow — login, guild listing, settings load, save, and the CSRF and origin rejections — using an in-memory Postgres and a mocked Discord API.
