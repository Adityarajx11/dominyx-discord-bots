import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE = 'dominyx_session';
const STATE_COOKIE = 'dominyx_oauth_state';
const SESSION_TTL = 60 * 60 * 8;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

const json = (res, status, payload, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(payload));
};
const redirect = (res, location, headers = {}) => { res.writeHead(302, { location, ...headers }); res.end(); };
const configReady = () => Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET && process.env.DOMINYX_SESSION_SECRET);
const originFor = (req) => process.env.DOMINYX_PUBLIC_URL || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const redirectUriFor = (req) => process.env.DISCORD_REDIRECT_URI || `${originFor(req)}/api/auth/callback`;
const secureRequest = (req) => (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' || process.env.NODE_ENV === 'production';
const cookieFlags = (req, maxAge = SESSION_TTL) => `Path=/; HttpOnly; SameSite=${secureRequest(req) ? 'None' : 'Lax'}; ${secureRequest(req) ? 'Secure; ' : ''}Max-Age=${maxAge}`;
const appendCookie = (res, value) => { const prior = res.getHeader('set-cookie') || []; res.setHeader('set-cookie', [...prior, value]); };
const clearCookie = (res, name) => appendCookie(res, `${name}=; ${cookieFlags({ headers: {} }, 0)}`);

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((item) => {
    const index = item.indexOf('=');
    return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim())];
  }));
}
function keyFromSecret() { return crypto.createHash('sha256').update(process.env.DOMINYX_SESSION_SECRET || 'development-only-secret').digest(); }
function encrypt(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFromSecret(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL * 1000 }), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((part) => part.toString('base64url')).join('.');
}
function decrypt(value) {
  try {
    const [ivText, tagText, bodyText] = value.split('.');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyFromSecret(), Buffer.from(ivText, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
    const body = Buffer.concat([decipher.update(Buffer.from(bodyText, 'base64url')), decipher.final()]);
    const data = JSON.parse(body.toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}
function sessionFor(req) { const value = parseCookies(req)[SESSION_COOKIE]; return value ? decrypt(value) : null; }
function safeUser(user) { return { id: user.id, username: user.username, global_name: user.global_name, avatar: user.avatar, discriminator: user.discriminator }; }
async function readBody(req) { let raw = ''; for await (const chunk of req) raw += chunk; try { return raw ? JSON.parse(raw) : {}; } catch { return {}; } }
async function discordRequest(url, options = {}) { const response = await fetch(url, options); const text = await response.text(); let data; try { data = JSON.parse(text); } catch { data = { message: text }; } if (!response.ok) throw new Error(data.message || `Discord request failed (${response.status})`); return data; }
function requireSession(req, res) { const session = sessionFor(req); if (!session) { json(res, 401, { error: 'not_authenticated' }); return null; } return session; }
async function canManageGuild(session, guildId) {
  const guilds = await discordRequest('https://discord.com/api/users/@me/guilds', { headers: { authorization: `Bearer ${session.accessToken}` } });
  const guild = guilds.find((item) => item.id === guildId);
  if (!guild) return false;
  const permissions = BigInt(guild.permissions || 0);
  return (permissions & 0x8n) === 0x8n || (permissions & 0x20n) === 0x20n;
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/health') return json(res, 200, { ok: true, dashboard: true, discordConfigured: configReady(), railwayConfigured: Boolean(process.env.RAILWAY_BOT_API_URL && process.env.RAILWAY_BOT_API_KEY) });
  if (url.pathname === '/api/auth/login') {
    if (!configReady()) return redirect(res, '/dashboard.html?error=oauth_not_configured');
    const state = crypto.randomBytes(24).toString('base64url');
    appendCookie(res, `${STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieFlags(req, 600)}`);
    const params = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, redirect_uri: redirectUriFor(req), response_type: 'code', scope: 'identify guilds' });
    return redirect(res, `https://discord.com/oauth2/authorize?${params}`);
  }
  if (url.pathname === '/api/auth/callback') {
    if (!configReady()) return json(res, 503, { error: 'dashboard_not_configured' });
    const cookies = parseCookies(req);
    if (!url.searchParams.get('code') || !url.searchParams.get('state') || cookies[STATE_COOKIE] !== url.searchParams.get('state')) return json(res, 400, { error: 'invalid_oauth_state' });
    try {
      const token = await discordRequest('https://discord.com/api/oauth2/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: redirectUriFor(req) }) });
      const user = await discordRequest('https://discord.com/api/users/@me', { headers: { authorization: `${token.token_type} ${token.access_token}` } });
      appendCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(encrypt({ user: safeUser(user), accessToken: token.access_token }))}; ${cookieFlags(req)}`);
      appendCookie(res, `${STATE_COOKIE}=; ${cookieFlags(req, 0)}`);
      return redirect(res, '/dashboard.html');
    } catch (error) { return redirect(res, `/dashboard.html?error=${encodeURIComponent(error.message)}`); }
  }
  if (url.pathname === '/api/auth/me') { const session = sessionFor(req); return json(res, 200, session ? { authenticated: true, user: session.user } : { authenticated: false }); }
  if (url.pathname === '/api/auth/logout') { appendCookie(res, `${SESSION_COOKIE}=; ${cookieFlags(req, 0)}`); return redirect(res, '/'); }
  if (url.pathname === '/api/guilds') {
    const session = requireSession(req, res); if (!session) return;
    try {
      const guilds = await discordRequest('https://discord.com/api/users/@me/guilds', { headers: { authorization: `Bearer ${session.accessToken}` } });
      const manageable = guilds.filter((guild) => (BigInt(guild.permissions || 0) & 0x8n) === 0x8n || (BigInt(guild.permissions || 0) & 0x20n) === 0x20n).map((guild) => ({ id: guild.id, name: guild.name, icon: guild.icon, owner: guild.owner, permissions: guild.permissions }));
      return json(res, 200, manageable);
    } catch (error) { return json(res, 502, { error: 'discord_guilds_failed', message: error.message }); }
  }
  const settingsMatch = url.pathname.match(/^\/api\/guilds\/([^/]+)\/settings$/);
  if (settingsMatch) {
    const session = requireSession(req, res); if (!session) return;
    if (!process.env.RAILWAY_BOT_API_URL || !process.env.RAILWAY_BOT_API_KEY) return json(res, 503, { error: 'railway_api_not_configured', message: 'Connect RAILWAY_BOT_API_URL and RAILWAY_BOT_API_KEY to enable live bot settings.' });
    const guildId = settingsMatch[1];
    try {
      if (!await canManageGuild(session, guildId)) return json(res, 403, { error: 'guild_forbidden', message: 'You do not have permission to manage this Discord server.' });
    } catch (error) { return json(res, 502, { error: 'discord_permission_check_failed', message: error.message }); }
    const upstream = `${process.env.RAILWAY_BOT_API_URL.replace(/\/$/, '')}/guilds/${encodeURIComponent(guildId)}/settings`;
    try {
      const body = req.method === 'PUT' ? await readBody(req) : undefined;
      const response = await fetch(upstream, { method: req.method, headers: { authorization: `Bearer ${process.env.RAILWAY_BOT_API_KEY}`, 'content-type': 'application/json', 'x-discord-user-id': session.user.id, 'x-discord-guild-id': guildId }, body: body ? JSON.stringify(body) : undefined });
      const text = await response.text(); let data; try { data = JSON.parse(text); } catch { data = { message: text }; }
      return json(res, response.status, data);
    } catch (error) { return json(res, 502, { error: 'railway_api_failed', message: error.message }); }
  }
  return json(res, 404, { error: 'not_found' });
}

function serveStatic(req, res, url) {
  let requested = url.pathname === '/' ? '/index.html' : url.pathname === '/dashboard' ? '/dashboard.html' : url.pathname;
  if (requested.includes('..')) return json(res, 400, { error: 'invalid_path' });
  const filePath = path.join(ROOT, requested);
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) return json(res, 404, { error: 'not_found' });
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream', 'cache-control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=300' });
    fs.createReadStream(filePath).pipe(res);
  });
}

export async function handler(req, res) {
  const url = new URL(req.url, originFor(req));
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  return serveStatic(req, res, url);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) http.createServer((req, res) => handler(req, res)).listen(PORT, '0.0.0.0', () => console.log(`Dominyx dashboard listening on ${PORT}`));
