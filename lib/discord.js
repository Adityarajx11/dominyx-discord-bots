import { env, botTokens, botTokenFor } from './env.js';

const API = 'https://discord.com/api/v10';

let botGuildMapCache = null;
let botGuildMapCachedAt = 0;
const BOT_MAP_TTL = 5 * 60 * 1000;

export async function discordRequest(path, { token, bot, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  else headers.Authorization = `Bot ${bot || env.generalBotToken}`;

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Discord request failed (${response.status})`);
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function exchangeCode(code, redirectUri) {
  const response = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Keep Discord's own error code on the error so callers branch on that
    // instead of parsing the human readable description.
    const error = new Error(`${data.error || 'discord_error'}: ${data.error_description || ''}`.trim());
    error.code = data.error || 'discord_error';
    error.description = data.error_description || '';
    throw error;
  }
  return data;
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.error || 'Token refresh failed');
  return data;
}

export async function getUser(accessToken) {
  return discordRequest('/users/@me', { token: accessToken });
}

// Checks whether the client id and secret still match the Discord application.
// Discord rejects a bad secret before it looks at the redirect URI, so a
// successful exchange attempt with a throwaway code means the credentials are
// good. The result is cached because this runs from the health endpoint.
let credentialsCheck = null;
const CREDENTIALS_TTL = 5 * 60 * 1000;

export async function checkClientCredentials() {
  if (!env.clientId || !env.clientSecret) return null;
  // The test suite must not reach the network.
  if (process.env.NODE_ENV === 'test') return null;
  if (credentialsCheck && Date.now() - credentialsCheck.at < CREDENTIALS_TTL) {
    return credentialsCheck.valid;
  }

  let valid = false;
  try {
    const response = await fetch(`${API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        grant_type: 'authorization_code',
        code: 'aurex-credential-check',
        redirect_uri: env.redirectUri || 'https://localhost/api/auth/callback',
      }),
    });
    const data = await response.json().catch(() => ({}));
    // invalid_grant means the code was rejected but the client is fine.
    valid = data.error === 'invalid_grant';
  } catch {
    valid = false;
  }

  credentialsCheck = { valid, at: Date.now() };
  return valid;
}

// Discord answers 403 "Missing Access" when the guilds scope was not granted.
// Swallowing that would look exactly like having no servers, so the error is
// passed on and the dashboard can explain what happened.
export async function getUserGuilds(accessToken) {
  try {
    return await discordRequest('/users/@me/guilds', { token: accessToken });
  } catch (error) {
    if (error.status === 403 || error.code === 50001) {
      const missing = new Error('Discord did not grant access to your server list.');
      missing.status = 403;
      missing.code = 'guilds_scope_missing';
      throw missing;
    }
    throw error;
  }
}

const ADMINISTRATOR = 8n;
const MANAGE_GUILD = 32n;

export function hasManagePermission(permissions) {
  const bits = BigInt(permissions || 0);
  return (bits & ADMINISTRATOR) === ADMINISTRATOR || (bits & MANAGE_GUILD) === MANAGE_GUILD;
}

// Discord's permissions field for a user only reflects role derived
// permissions, so a server owner can come back without the Administrator bit
// even though they can always manage the server. The owner flag is the
// reliable signal, so it is checked as well.
export function canManage(guild) {
  if (!guild) return false;
  if (guild.owner === true) return true;
  return hasManagePermission(guild.permissions);
}

// guildId -> Set of guild ids, per bot. One Discord call per configured bot token.
export async function getBotGuildMap({ force = false } = {}) {
  if (!force && botGuildMapCache && Date.now() - botGuildMapCachedAt < BOT_MAP_TTL) {
    return botGuildMapCache;
  }

  const map = {};
  await Promise.all(
    botTokens().map(async ({ key, token }) => {
      try {
        const guilds = await discordRequest('/users/@me/guilds', { bot: token });
        map[key] = new Set(guilds.map((guild) => guild.id));
      } catch {
        map[key] = new Set();
      }
    }),
  );

  botGuildMapCache = map;
  botGuildMapCachedAt = Date.now();
  return map;
}

export function invalidateBotGuildMap() {
  botGuildMapCache = null;
  botGuildMapCachedAt = 0;
}

// Finds a bot token that is actually present in the guild, for channel/role reads.
export async function getGuildBotToken(guildId) {
  const candidates = [
    ...botTokens().map((entry) => entry.token),
    env.generalBotToken,
  ].filter(Boolean);

  for (const token of candidates) {
    try {
      const response = await fetch(`${API}/guilds/${guildId}`, {
        headers: { Authorization: `Bot ${token}` },
      });
      if (response.ok) return token;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

export async function getGuild(guildId, botToken) {
  return discordRequest(`/guilds/${guildId}`, { bot: botToken });
}

export async function getGuildChannels(guildId, botToken) {
  return discordRequest(`/guilds/${guildId}/channels`, { bot: botToken });
}

export async function getGuildRoles(guildId, botToken) {
  return discordRequest(`/guilds/${guildId}/roles`, { bot: botToken });
}

// Which of the six bots are installed in this guild.
export async function getBotsInGuild(guildId, map = null) {
  const guildMap = map || (await getBotGuildMap());
  const present = {};
  for (const [key, guilds] of Object.entries(guildMap)) {
    if (guilds.has(guildId)) present[key] = true;
  }
  return Object.keys(present).length ? present : null;
}

export { botTokenFor };
