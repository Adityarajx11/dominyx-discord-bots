// Centralised environment access. Every secret is read lazily from process.env so
// the same module works under `node server.mjs`, Railway, and Vercel functions.
// Nothing in this file is ever sent to the browser.

const text = (value) => (typeof value === 'string' ? value.trim() : '');

export const BOT_KEYS = ['music', 'level', 'greet', 'ticket', 'ping', 'guard'];

export const env = {
  get port() {
    return Number(process.env.PORT || 3000);
  },
  get clientId() {
    return text(process.env.DISCORD_CLIENT_ID);
  },
  get clientSecret() {
    return text(process.env.DISCORD_CLIENT_SECRET);
  },
  get redirectUri() {
    return text(process.env.DISCORD_REDIRECT_URI);
  },
  get publicUrl() {
    return text(process.env.AUREX_PUBLIC_URL || process.env.PUBLIC_APP_URL);
  },
  get sessionSecret() {
    return text(process.env.AUREX_SESSION_SECRET);
  },
  get databaseUrl() {
    return text(process.env.DATABASE_URL);
  },
  get generalBotToken() {
    return text(process.env.BOT_TOKEN);
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
  // Vercel freezes the filesystem after boot, so a single pooled connection is the
  // safe maximum. Railway keeps a long-lived process and can hold more.
  get poolMax() {
    return Number(process.env.PG_POOL_MAX || (process.env.VERCEL ? 1 : 5));
  },
};

export function botTokenFor(key) {
  return text(process.env[`BOT_TOKEN_${key.toUpperCase()}`]);
}

export function botIdFor(key) {
  return text(process.env[`BOT_ID_${key.toUpperCase()}`]);
}

export function botTokens() {
  return BOT_KEYS.map((key) => ({ key, token: botTokenFor(key) })).filter((entry) => entry.token);
}

export function oauthReady() {
  return Boolean(env.clientId && env.clientSecret && env.sessionSecret);
}

export function databaseReady() {
  return Boolean(env.databaseUrl);
}

export function botTokensReady() {
  return botTokens().length > 0;
}
