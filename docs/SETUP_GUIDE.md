# Dominyx — full setup guide

Everything from an empty Discord account to a working six-bot network with a
control dashboard. Follow the parts in order; each one assumes the previous is
done.

- **Bot network:** <https://github.com/Adityarajx11/Aurex-Network>
- **Dashboard:** <https://github.com/adixlucifer0011/aurex-discord-bots>

---

## 0. What you are building

```
                       ┌──────────────────────────┐
   People ───────────► │  Discord  (6 applications) │
                       └──────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        Music bot            Level bot          Guard bot        (6 in total,
              │                   │                   │            one Railway
              └───────────────────┴───────────────────┘            service each)
                                  │
                     reads & writes one table per bot
                                  ▼
                    ┌───────────────────────────┐
                    │  Railway Postgres           │
                    │  music_settings            │
                    │  level_config              │
                    │  greet_settings            │
                    │  ticket_config             │
                    │  ping_settings             │
                    │  guard_settings            │
                    └───────────────────────────┘
                                  ▲
                                  │ reads & writes the same tables
                    ┌─────────────┴─────────────┐
                    │  Aurex dashboard (Vercel)  │
                    │  sign in, pick a server,   │
                    │  configure every module    │
                    └───────────────────────────┘
```

The dashboard and the bots never talk to each other directly. They share the
database. That is the whole design.

---

## 1. Prerequisites

| You need | Why | Free? |
|---|---|---|
| Node.js 20 or newer | runs the bots and the dashboard | yes |
| A GitHub account | hosts both repositories | yes |
| A Discord account | owns the applications | yes |
| A Railway account | hosts the bots and the database | yes, with limits |
| A Vercel account | hosts the dashboard | yes |
| A Lavalink server | streams the music | free public ones exist |

---

## 2. Create the Discord applications

You need **seven** applications. Six are bots. The seventh is the dashboard's
sign-in app and has no bot user.

Open <https://discord.com/developers/applications> and click **New Application**
seven times. Name them:

| Application | Type | Application (Client) ID |
|---|---|---|
| Dominyx Music | Bot | `1549710217862709309` |
| Dominyx Level | Bot | `1549712819103211620` |
| Dominyx Greet | Bot | `1549713810992926720` |
| Dominyx Ticket | Bot | `1549714961742172191` |
| Dominyx Ping | Bot | `1549715847478771762` |
| Dominyx Guard | Bot | `1549716406155608086` |
| Dominyx Dashboard | **no bot** | `1549747403748413470` |

If you are creating these from scratch on a fresh account, the ids will be
different. Keep a note of each one, you will need them all.

### For each of the six bot applications

1. **Bot → Reset Token** and copy it. This is the `BOT_TOKEN`. It is shown
   once.
2. **Bot → Privileged Gateway Intents** — turn on **Server Members Intent**.
   Music, Greet, Ticket and Guard need it to work.
3. **Bot → Application Permissions** — nothing to change here.

### For the Dashboard application

1. **OAuth2 → Redirects → Add Redirect**:
   ```
   https://aurex-control.vercel.app/api/auth/callback
   ```
   The address must match exactly, including protocol, hostname and path.
   For local work also add:
   ```
   http://localhost:3000/api/auth/callback
   ```
2. **OAuth2 → Client Secret → Reset** and copy it. This is
   `DISCORD_CLIENT_SECRET`.
3. Leave **Client ID** as it is, that is `DISCORD_CLIENT_ID`.

### Invite the bots to your server

For each bot application, **OAuth2 → URL Generator**:

- Scopes: `bot`, `applications.commands`
- Bot permissions: `Administrator` is the easy path. The minimum for each is
  listed in part 6.

Copy the generated link and open it in your browser to add that bot to a server
you own.

---

## 3. Create the database

1. <https://railway.com> → **New Project** → **Add Service** → **PostgreSQL**.
2. Railway creates it and gives you two connection strings:
   - **Internal** — `postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway`
   - **Public** — `postgresql://postgres:PASSWORD@HOST.proxy.rlwy.net:PORT/railway`
3. Copy both. The bots use the **internal** one. The dashboard uses the
   **public** one, because Vercel is not inside Railway's network.

> The public host and port change if you ever recreate or move the database.
> If the dashboard suddenly cannot reach the database, re-copy it from
> Railway → Postgres → Connect.

The tables do not need to be created by hand. Every bot creates the table it
owns when it starts, and the dashboard creates any column that is missing.

| Bot | Table |
|---|---|
| Music | `music_settings` |
| Level | `level_config` |
| Greet | `greet_settings` |
| Ticket | `ticket_config` |
| Ping | `ping_settings` |
| Guard | `guard_settings` |

---

## 4. Deploy the bots to Railway

In your Railway project, add a service for each bot.

1. **Service → Settings → Source** → connect the repository
   `Adityarajx11/Aurex-Network`, and set the branch to `main`.
2. **Service → Settings → Build**:
   - **Root Directory**: `/`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:music` — one per service:

   | Service | Start command |
   |---|---|
   | Music | `npm run start:music` |
   | Level | `npm run start:level` |
   | Greet | `npm run start:greet` |
   | Ticket | `npm run start:ticket` |
   | Ping | `npm run start:ping` |
   | Guard | `npm run start:guard` |

3. **Service → Variables**. Every bot needs:

   ```
   BOT_TOKEN=<that bot's token>
   CLIENT_ID=<that bot's application id>
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

   The music bot also needs Lavalink:

   ```
   LAVALINK_HOST=<your lavalink host>
   LAVALINK_PORT=<port>
   LAVALINK_PASSWORD=<password>
   LAVALINK_SECURE=true
   ```

   The ping bot needs a YouTube key:

   ```
   YOUTUBE_API_KEY=<your key>
   YOUTUBE_POLL_MINUTES=10
   ```

   The music bot's stats and leaderboards use Last.fm:

   ```
   LASTFM_API_KEY=<your key>
   ```

   `${{Postgres.DATABASE_URL}}` makes Railway inject the internal connection
   string automatically. Never paste the public URL into a bot.

4. Redeploy the service. The log should end with **Database pool ready** and
   the bot should come online.

### Register the slash commands

The commands do not appear until you deploy them. Run these once per bot,
locally, with the bot's `.env` in place:

```bash
npm run deploy:music
npm run deploy:level
npm run deploy:greet
npm run deploy:ticket
npm run deploy:ping
npm run deploy:guard
```

Global commands can take up to an hour to appear. Set `GUILD_ID` in the
bot's `.env` to register them instantly in one server while you test.

---

## 5. Deploy the dashboard to Vercel

1. <https://vercel.com> → **Add New → Project** → import
   `adixlucifer0011/aurex-discord-bots`.
2. Leave **Root Directory** empty and let Vercel detect Node.
3. Add every environment variable under **Settings → Environment Variables**:

   ```
   DISCORD_CLIENT_ID=<dashboard application id>
   DISCORD_CLIENT_SECRET=<dashboard client secret>
   DISCORD_REDIRECT_URI=https://aurex-control.vercel.app/api/auth/callback
   AUREX_PUBLIC_URL=https://aurex-control.vercel.app
   AUREX_SESSION_SECRET=<64 random hex characters>
   DATABASE_URL=<the public Railway url>
   BOT_TOKEN=<the general bot token, optional>
   BOT_TOKEN_MUSIC=<music token>
   BOT_TOKEN_LEVEL=<level token>
   BOT_TOKEN_GREET=<greet token>
   BOT_TOKEN_TICKET=<ticket token>
   BOT_TOKEN_PING=<ping token>
   BOT_TOKEN_GUARD=<guard token>
   BOT_ID_MUSIC=<music application id>
   BOT_ID_LEVEL=<level application id>
   BOT_ID_GREET=<greet application id>
   BOT_ID_TICKET=<ticket application id>
   BOT_ID_PING=<ping application id>
   BOT_ID_GUARD=<guard application id>
   PORT=3000
   NODE_ENV=production
   PG_POOL_MAX=1
   ```

   Generate the session secret with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   The `BOT_ID_*` values build the **Add to Discord** links, and the
   `BOT_TOKEN_*` values tell the dashboard which modules are installed in which
   server.

4. Deploy. Then check it:

   ```bash
   curl https://aurex-control.vercel.app/api/health
   ```

   ```json
   {
     "oauth":    { "configured": true, "credentialsValid": true },
     "database": { "configured": true, "reachable": true },
     "bots": { "configured": ["music","level","greet","ticket","ping","guard"] }
   }
   ```

   `credentialsValid` and `reachable` must both be `true`.

---

## 6. Minimum bot permissions

| Bot | Needs |
|---|---|
| Music | Connect, Speak, Move Members, View Channel, Send Messages, Embed Links, Use VAD |
| Level | View Channel, Send Messages, Manage Roles |
| Greet | View Channel, Send Messages, Manage Roles, Manage Nicknames |
| Ticket | View Channel, Send Messages, Manage Channels, Manage Roles |
| Ping | View Channel, Send Messages, Mention Everyone |
| Guard | View Channel, Send Messages, Manage Roles, Manage Channels, Manage Messages, Kick, Ban, Moderate Members |

---

## 7. Verify the whole system

1. Open `https://aurex-control.vercel.app`.
2. Click **Login with Discord** → the Aurex authentication page → click
   **Login with Discord** again → Discord asks you to allow access → tick
   **identify** and **servers** → you land on the dashboard.
3. Your servers appear in the left rail. Each one shows a badge for every
   module installed in it.
4. Pick a server. A module that is not installed shows **Add it to this
   server** with a link to invite that bot. A module that is installed shows
   its settings form.
5. Change something and press **Save changes**. It writes straight to that
   bot's table in Postgres.
6. Reload the bot on Railway. The new value is in effect.

---

## 8. Every command

### Music

| Command | What it does |
|---|---|
| `/play` | Play a song — name, link, or a full playlist in order |
| `/join` | Make the bot join your voice channel |
| `/leave` | Make the bot leave and clear the queue |
| `/queue` | Show what is playing and what is next |
| `/nowplaying` | Show the song playing right now |
| `/pause` | Pause the music, resume it anytime |
| `/resume` | Resume the paused music |
| `/skip` | Skip to the next song in the queue |
| `/stop` | Stop everything and clear the queue |
| `/clear` | Clear the upcoming queue, keep the current song |
| `/remove` | Remove one song from the queue by position |
| `/shuffle` | Shuffle the upcoming songs |
| `/loop` | Loop off, one song, or the whole queue |
| `/volume` | Set the playback volume, 0 to 200 percent |
| `/247` | 24/7 mode so the bot never auto-leaves voice |
| `/sleep` | Sleep timer — stop music later, automatically |
| `/radio` | Artist radio that never runs dry |
| `/recommend` | Music for a mood — Chill, Party, Workout and more |
| `/suggest` | More songs from an artist, picked from a menu |
| `/mylist` | Manage your personal saved playlist |
| `/prefix` | Show or change the prefix for `!p` style commands |
| `/stats` | Your listening stats — songs, time, top artists |
| `/music-leaderboard` | Top music XP fans, season or lifetime |
| `/xpsetup` | Admin only — music XP tiers and season |

### Level

| Command | What it does |
|---|---|
| `/rank` | Your level card with an XP bar |
| `/leaderboard` | Top chatters by level and XP |
| `/levelconfig` | Admin only — channel, role rewards, and the rest of the leveling setup |

### Greet

| Command | What it does |
|---|---|
| `/greetsetup` | Admin only — welcome channel, message, auto-role, card theme, goodbye, DM, bots |

### Ticket

| Command | What it does |
|---|---|
| `/ticketsetup` | Admin only — category, staff role, logs, max tickets, banner, panel title and rules |
| `/ticketpanel` | Post the ticket creation panel in the current channel |

### Ping

| Command | What it does |
|---|---|
| `/pingsetup` | Admin only — YouTube channel, alert channel, message, mention role, poll interval |

### Guard

| Command | What it does |
|---|---|
| `/guardsetup` | Admin only — mod log, filters, anti-raid, age gate, anti-nuke, self roles |
| `/ban` | Ban a member, logged as a case |
| `/bulkban` | Ban up to 50 users at once by id |
| `/kick` | Kick a member, logged as a case |
| `/warn` | Warn a member — X warns auto-mute or ban |
| `/cases` | Case history for a member — bans, kicks, warns |
| `/note` | Staff notes on a member |
| `/lock` | Lock this channel, nobody can talk |
| `/unlock` | Unlock a locked channel |
| `/roles` | Browse and pick self-assignable roles |

---

## 9. Music from zero to last

A complete first song, start to finish.

**Step 1 — the bot needs a Lavalink server.** Without it the music bot comes
online but cannot play. Set `LAVALINK_HOST`, `LAVALINK_PORT`,
`LAVALINK_PASSWORD` and `LAVALINK_SECURE` on the Music service and redeploy.

**Step 2 — join a voice channel.** Join a voice channel in your server, then:

```
/join
```

The bot joins the channel you are in. If it does not, check that Music has
**Connect** and **Speak**, and that **Server Members Intent** is on.

**Step 3 — play something.**

```
/play never gonna give you up
```

or a link:

```
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

or a whole playlist, which plays in order:

```
/play https://www.youtube.com/playlist?list=PLxxxxxxxx
```

**Step 4 — control it.**

```
/queue          what is playing and what is next
/nowplaying     the current song
/pause          pause it
/resume         bring it back
/skip           next song
/volume 120     louder
/loop           repeat one song
/remove 2       drop the third song
/shuffle        mix up the queue
/247            never leave the channel
/stop           stop everything
```

**Step 5 — the prefix style.** If you prefer `!p song` over `/play`:

```
/prefix !
```

then in the same voice channel:

```
!p bohemian rhapsody
!skip
!queue
```

**Step 6 — keep it running overnight.**

```
/247
```

The bot will not leave the channel when it goes quiet.

**Step 7 — a timer to stop it later.**

```
/sleep 2h
```

**Step 8 — find something new.**

```
/recommend Chill
/radio <artist>
/suggest
```

**Step 9 — save it for later.**

```
/mylist add never gonna give you up
/mylist show
/mylist play
```

**Step 10 — see how you listen.**

```
/stats
/music-leaderboard
```

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `invalid_client` on login | the Discord application secret was rotated | Reset Secret in the Developer Portal, update `DISCORD_CLIENT_SECRET` on Vercel, redeploy |
| Dashboard shows no servers | Discord was not allowed to share your server list | Sign out, sign in again, tick **servers** on the consent screen |
| You own the server but it is missing | you do not have Administrator or Manage Server | Grant yourself Administrator in the server's role settings |
| A module says "not installed" | that bot is not in the server | Use the **Add it to this server** link on that tab |
| `database.reachable: false` | the public Railway URL changed | Railway → Postgres → Connect, copy the new public URL to Vercel |
| `ENOTFOUND postgres.railway.internal` | a Vercel deployment is using the internal URL | Vercel must use the **public** `proxy.rlwy.net` URL |
| Music does not play | Lavalink is missing or wrong | Check the four `LAVALINK_*` variables, redeploy Music |
| Commands do not appear | slash commands were never registered | Run `npm run deploy:music` and the rest |
| Bots are online but nothing is stored | the bot and the dashboard use different databases | Both must point at the same Postgres instance |

Check the health endpoint first. It names what is broken:

```bash
curl https://aurex-control.vercel.app/api/health
```

---

## 11. Environment variable reference

### Website (Vercel)

| Variable | Required | Purpose |
|---|---|---|
| `DISCORD_CLIENT_ID` | yes | Dashboard OAuth application id |
| `DISCORD_CLIENT_SECRET` | yes | Dashboard OAuth client secret |
| `DISCORD_REDIRECT_URI` | yes | Must be registered in Discord |
| `AUREX_PUBLIC_URL` | yes | The site's own origin |
| `AUREX_SESSION_SECRET` | yes | 32 random bytes, encrypts the session cookie |
| `DATABASE_URL` | yes | Public Railway URL |
| `BOT_TOKEN_<MODULE>` | yes | Detects which modules are installed where |
| `BOT_ID_<MODULE>` | yes | Builds the Add to Discord links |
| `BOT_TOKEN` | no | Fallback for reading channels in servers with no module |
| `PORT` | no | Defaults to 3000 |
| `NODE_ENV` | no | `production` in production |
| `PG_POOL_MAX` | no | Keep at 1 on Vercel, 5 or more on Railway |

### Bots (Railway)

| Variable | Required by | Purpose |
|---|---|---|
| `BOT_TOKEN` | all six | The bot's own token |
| `CLIENT_ID` | all six | The bot's application id |
| `DATABASE_URL` | all six | Internal Railway URL |
| `LAVALINK_*` | Music | Music streaming server |
| `LASTFM_API_KEY` | Music | Stats and leaderboards |
| `YOUTUBE_API_KEY` | Ping | Finds live streams |
| `YOUTUBE_POLL_MINUTES` | Ping | How often to check, default 10 |
| `GUILD_ID` | any | Registers commands instantly in one server while testing |
