import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env, oauthReady, databaseReady, botTokens, botIdFor } from './lib/env.js';
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  SESSION_TTL,
  encryptSession,
  sessionFor,
  parseCookies,
  createCsrfToken,
  safeUser,
} from './lib/session.js';
import {
  exchangeCode,
  refreshAccessToken,
  getUser,
  getUserGuilds,
  canManage,
  getBotGuildMap,
  getBotsInGuild,
  getGuildBotToken,
  getGuild,
  getGuildChannels,
  getGuildRoles,
} from './lib/discord.js';
import { MODULES, MODULE_KEYS } from './lib/schema.js';
import { inviteLinks } from './lib/invites.js';
import { readAllModules, readModule, writeModule, diffFields } from './lib/settings.js';
import { ensureSchema, ping as pingDatabase, getPool } from './lib/db.js';
import { rateLimit, originAllowed, csrfValid, audit } from './lib/security.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MAX_BODY_BYTES = 256 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

// Only these paths are reachable over HTTP. Everything else (lib/, .env, …) stays private.
const PUBLIC_FILES = new Set([
  '/index.html',
  '/dashboard.html',
  '/styles.css',
  '/dashboard.css',
  '/main.js',
  '/dashboard.js',
  '/manus-routes.json',
  '/favicon.ico',
  '/robots.txt',
  '/manifest.webmanifest',
]);

const json = (res, status, payload, headers = {}) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

const redirect = (res, location, headers = {}) => {
  res.writeHead(302, { location, ...headers });
  res.end();
};

const originFor = (req) =>
  env.publicUrl || `${(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim()}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const redirectUriFor = (req) => env.redirectUri || `${originFor(req)}/api/auth/callback`;
const secureRequest = (req) =>
  (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' || env.isProduction;
const cookieFlags = (req, maxAge = SESSION_TTL) =>
  `Path=/; HttpOnly; SameSite=${secureRequest(req) ? 'None' : 'Lax'}; ${secureRequest(req) ? 'Secure; ' : ''}Max-Age=${maxAge}`;
const appendCookie = (res, value) => {
  const prior = res.getHeader('set-cookie') || [];
  res.setHeader('set-cookie', [...prior, value]);
};
const clearCookie = (res, req, name) => appendCookie(res, `${name}=; ${cookieFlags(req, 0)}`);

// Behind a proxy the socket address is the proxy, so prefer the forwarded header.
const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

async function readBody(req) {
  // Some runtimes (Vercel functions) pre-parse the body and leave the stream consumed.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      const error = new Error('Invalid JSON body');
      error.status = 400;
      throw error;
    }
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY_BYTES) {
      const error = new Error('Request body too large');
      error.status = 413;
      throw error;
    }
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    const error = new Error('Invalid JSON body');
    error.status = 400;
    throw error;
  }
}

// Resolves the session and transparently refreshes an expired Discord token.
async function authenticate(req, res) {
  let session = sessionFor(req);
  if (!session) return null;

  const needsRefresh = session.expiresAt && session.expiresAt - Date.now() < 60_000;
  if (needsRefresh && session.refreshToken) {
    try {
      const tokens = await refreshAccessToken(session.refreshToken);
      session = {
        ...session,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || session.refreshToken,
        expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
      };
      appendCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(encryptSession(session))}; ${cookieFlags(req)}`);
    } catch (error) {
      console.error('[auth] token refresh failed:', error.message);
      return null;
    }
  }

  return session;
}

async function requireSession(req, res) {
  const session = await authenticate(req, res);
  if (!session) {
    json(res, 401, { error: 'not_authenticated' });
    return null;
  }
  return session;
}

// Confirms the signed-in user can administer the requested guild.
async function requireGuildAccess(req, res, guildId) {
  const session = await requireSession(req, res);
  if (!session) return null;

  const guilds = await getUserGuilds(session.accessToken);
  const guild = guilds.find((item) => item.id === guildId);
  if (!guild || !canManage(guild.permissions)) {
    json(res, 403, { error: 'guild_forbidden', message: 'You do not have permission to manage this Discord server.' });
    return null;
  }

  return { session, guild };
}

function moduleMetadata() {
  const result = {};
  for (const module of Object.values(MODULES)) {
    result[module.key] = {
      key: module.key,
      label: module.label,
      table: module.table,
      fields: Object.fromEntries(
        Object.entries(module.fields).map(([name, field]) => [
          name,
          {
            type: field.type,
            ...(field.options ? { options: field.options } : {}),
            ...(field.min !== undefined ? { min: field.min } : {}),
            ...(field.max !== undefined ? { max: field.max } : {}),
            ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {}),
            default: field.default ?? null,
          },
        ]),
      ),
    };
  }
  return result;
}

async function handleApi(req, res, url) {
  const { pathname } = url;

  if (pathname === '/api/health') {
    const database = databaseReady();
    return json(res, 200, {
      ok: true,
      dashboard: true,
      oauth: { configured: oauthReady() },
      database: { configured: database, reachable: database ? await pingDatabase() : false },
      bots: {
        configured: botTokens().map((entry) => entry.key),
        applicationIds: MODULE_KEYS.filter((key) => botIdFor(key)),
      },
      modules: MODULE_KEYS,
    });
  }

  if (pathname === '/api/modules') {
    return json(res, 200, moduleMetadata());
  }

  if (pathname === '/api/invites') {
    return json(res, 200, inviteLinks());
  }

  if (pathname === '/api/auth/login') {
    if (!oauthReady()) return redirect(res, '/dashboard.html?error=oauth_not_configured');

    const limit = rateLimit(`login:${clientIp(req)}`, 20, 60_000);
    if (!limit.allowed) return json(res, 429, { error: 'rate_limited', message: 'Too many login attempts. Try again shortly.' });

    const state = createCsrfToken();
    appendCookie(res, `${STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieFlags(req, 600)}`);
    const params = new URLSearchParams({
      client_id: env.clientId,
      redirect_uri: redirectUriFor(req),
      response_type: 'code',
      scope: 'identify guilds',
      state,
    });
    return redirect(res, `https://discord.com/oauth2/authorize?${params}`);
  }

  if (pathname === '/api/auth/callback') {
    if (!oauthReady()) return json(res, 503, { error: 'dashboard_not_configured' });

    const cookies = parseCookies(req);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (url.searchParams.get('error')) {
      return redirect(res, '/dashboard.html?error=access_denied');
    }
    if (!code || !state || cookies[STATE_COOKIE] !== state) {
      return json(res, 400, { error: 'invalid_oauth_state' });
    }

    try {
      const tokens = await exchangeCode(code, redirectUriFor(req));
      const user = await getUser(tokens.access_token);
      const session = {
        user: safeUser(user),
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
        csrf: createCsrfToken(),
      };

      appendCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(encryptSession(session))}; ${cookieFlags(req)}`);
      clearCookie(res, req, STATE_COOKIE);
      return redirect(res, '/dashboard.html');
    } catch (error) {
      console.error('[auth] callback failed:', error.message);
      return redirect(res, `/dashboard.html?error=${encodeURIComponent(error.message)}`);
    }
  }

  if (pathname === '/api/auth/me') {
    const session = await authenticate(req, res);
    if (!session) return json(res, 200, { authenticated: false });
    return json(res, 200, { authenticated: true, user: session.user, csrf: session.csrf });
  }

  if (pathname === '/api/auth/logout') {
    clearCookie(res, req, SESSION_COOKIE);
    return redirect(res, '/');
  }

  if (pathname === '/api/guilds') {
    const session = await requireSession(req, res);
    if (!session) return;

    try {
      const [guilds, botMap] = await Promise.all([getUserGuilds(session.accessToken), getBotGuildMap()]);
      const manageable = guilds
        .filter((guild) => canManage(guild.permissions))
        .map((guild) => ({
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          bots: getBotsInGuild(guild.id, botMap),
        }));
      return json(res, 200, manageable);
    } catch (error) {
      return json(res, 502, { error: 'discord_guilds_failed', message: error.message });
    }
  }

  const settingsMatch = pathname.match(/^\/api\/guilds\/([^/]+)\/settings$/);
  if (settingsMatch) {
    const guildId = decodeURIComponent(settingsMatch[1]);

    if (req.method === 'GET') {
      let access;
      try {
        access = await requireGuildAccess(req, res, guildId);
      } catch (error) {
        return json(res, 502, { error: 'discord_permission_check_failed', message: error.message });
      }
      if (!access) return;

      if (!getPool()) {
        return json(res, 503, {
          error: 'database_not_configured',
          message: 'DATABASE_URL is not set, so module settings cannot be loaded.',
        });
      }

      try {
        await ensureSchema();
      } catch (error) {
        return json(res, 502, { error: 'database_unreachable', message: error.message });
      }

      const botToken = await getGuildBotToken(guildId);
      const [guild, channels, roles, settings, botMap] = await Promise.all([
        botToken ? getGuild(guildId, botToken).catch(() => null) : null,
        botToken ? getGuildChannels(guildId, botToken).catch(() => []) : [],
        botToken ? getGuildRoles(guildId, botToken).catch(() => []) : [],
        readAllModules(guildId),
        getBotGuildMap(),
      ]);

      return json(res, 200, {
        guild: guild ? { id: guild.id, name: guild.name, icon: guild.icon } : { id: guildId },
        bots: getBotsInGuild(guildId, botMap),
        channels: channels.map((channel) => ({ id: channel.id, name: channel.name, type: channel.type })),
        roles: roles
          .filter((role) => role.id !== guildId)
          .map((role) => ({ id: role.id, name: role.name, color: role.color })),
        settings,
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const limit = rateLimit(`settings:${clientIp(req)}`, 30, 60_000);
      if (!limit.allowed) {
        return json(res, 429, { error: 'rate_limited', message: 'Too many updates. Try again shortly.' });
      }

      if (!originAllowed(req)) {
        return json(res, 403, { error: 'origin_rejected', message: 'Request origin is not allowed.' });
      }

      let access;
      try {
        access = await requireGuildAccess(req, res, guildId);
      } catch (error) {
        return json(res, 502, { error: 'discord_permission_check_failed', message: error.message });
      }
      if (!access) return;

      if (!csrfValid(req, access.session)) {
        return json(res, 403, { error: 'csrf_failed', message: 'Security token mismatch. Reload the dashboard and try again.' });
      }

      if (!getPool()) {
        return json(res, 503, { error: 'database_not_configured' });
      }

      let body;
      try {
        body = await readBody(req);
      } catch (error) {
        return json(res, error.status || 400, { error: 'bad_request', message: error.message });
      }

      const moduleKey = body.module;
      const values = body.values;
      if (!moduleKey || !MODULE_KEYS.includes(moduleKey)) {
        return json(res, 400, { error: 'unknown_module', message: `module must be one of: ${MODULE_KEYS.join(', ')}` });
      }
      if (!values || typeof values !== 'object' || Array.isArray(values)) {
        return json(res, 400, { error: 'invalid_values', message: 'values must be an object.' });
      }

      try {
        const before = await readModule(guildId, moduleKey);
        const after = await writeModule(guildId, moduleKey, values);
        const changes = diffFields(before, after);

        await audit({
          userId: access.session.user.id,
          guildId,
          module: moduleKey,
          action: 'settings.update',
          changes,
        });

        return json(res, 200, { ok: true, module: moduleKey, settings: after, changes });
      } catch (error) {
        if (error.fields) {
          return json(res, 400, { error: 'invalid_values', message: error.message, fields: error.fields });
        }
        return json(res, 500, { error: 'save_failed', message: error.message });
      }
    }

    return json(res, 405, { error: 'method_not_allowed' });
  }

  return json(res, 404, { error: 'not_found' });
}

function serveStatic(req, res, url) {
  let requested = url.pathname === '/' ? '/index.html' : url.pathname === '/dashboard' ? '/dashboard.html' : url.pathname;

  if (!PUBLIC_FILES.has(requested)) return json(res, 404, { error: 'not_found' });

  const filePath = path.join(ROOT, requested.slice(1));
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) return json(res, 404, { error: 'not_found' });
    res.writeHead(200, {
      'content-type': MIME[path.extname(filePath)] || 'application/octet-stream',
      'cache-control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=300',
      'x-content-type-options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

export async function handler(req, res) {
  let url;
  try {
    url = new URL(req.url, originFor(req));
  } catch {
    return json(res, 400, { error: 'bad_request' });
  }

  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) {
    console.error('[server] unhandled error:', error);
    if (!res.headersSent) return json(res, 500, { error: 'server_error', message: error.message });
    res.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  http
    .createServer((req, res) => handler(req, res))
    .listen(env.port, '0.0.0.0', () => console.log(`Dominyx dashboard listening on ${env.port}`));
}
