import test from 'node:test';
import assert from 'node:assert/strict';
import { newDb } from 'pg-mem';

const db = newDb({ autoCreateForeignKeyIndices: true });
const pg = db.adapters.createPg();
const memoryPool = new pg.Pool();

const { usePool } = await import('../lib/db.js');
usePool(memoryPool);

const { handler } = await import('../server.mjs');

// The suite must not depend on whatever is in a local .env, so every variable
// it cares about is cleared and set explicitly here. This runs after the
// import above, because importing the server also loads dotenv.
const ENV_KEYS = [
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'AUREX_SESSION_SECRET',
  'AUREX_PUBLIC_URL',
  'BOT_TOKEN',
  'DATABASE_URL',
  'BOT_ID_MUSIC',
  'BOT_ID_LEVEL',
  'BOT_ID_GREET',
  'BOT_ID_TICKET',
  'BOT_ID_PING',
  'BOT_ID_GUARD',
];

const savedEnv = {};
for (const key of ENV_KEYS) {
  savedEnv[key] = process.env[key];
  delete process.env[key];
}

process.env.DISCORD_CLIENT_ID = 'client-123';
process.env.DISCORD_CLIENT_SECRET = 'secret-456';
process.env.AUREX_SESSION_SECRET = 'a-very-long-session-secret-for-tests';
process.env.AUREX_PUBLIC_URL = 'http://localhost:3000';
process.env.BOT_TOKEN = 'general-bot-token';
process.env.NODE_ENV = 'test';

test.after(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

// ---------------------------------------------------------------- discord mock

const GUILD = {
  id: 'guild-1',
  name: 'Aurex Test Server',
  icon: null,
  owner: true,
  // Discord reports role derived permissions for a user, so an owner can come
  // back without the Administrator bit. 1048576 is VIEW_CHANNEL only.
  permissions: '1048576',
};

// Set to a Discord error code to make the token exchange fail.
let mockTokenError = null;

const CHANNELS = [
  { id: 'chan-text', name: 'general', type: 0 },
  { id: 'chan-voice', name: 'Music', type: 2 },
  { id: 'chan-category', name: 'Support', type: 4 },
];

const ROLES = [
  { id: 'guild-1', name: '@everyone', color: 0 },
  { id: 'role-dj', name: 'DJ', color: 16711680 },
];

globalThis.fetch = async (input, options = {}) => {
  const url = String(input);
  const json = (payload, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
    json: async () => payload,
  });

  if (url.includes('/oauth2/token')) {
    if (mockTokenError) return json({ error: mockTokenError }, 401);
    return json({
      access_token: 'user-access-token',
      refresh_token: 'user-refresh-token',
      token_type: 'Bearer',
      expires_in: 604800,
      scope: 'identify guilds',
    });
  }
  if (url.includes('/users/@me/guilds')) return json([GUILD]);
  if (url.includes('/users/@me')) return json({ id: 'user-1', username: 'tester', global_name: 'Tester', avatar: null });
  if (url.includes('/guilds/guild-1/channels')) return json(CHANNELS);
  if (url.includes('/guilds/guild-1/roles')) return json(ROLES);
  if (url.includes('/guilds/guild-1')) return json(GUILD);
  return json({ message: 'not mocked' }, 404);
};

// ------------------------------------------------------------------- helpers

function mockReq({ method = 'GET', url = '/', headers = {}, body } = {}) {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  return {
    method,
    url,
    headers: { host: 'localhost:3000', ...headers },
    socket: { remoteAddress: '127.0.0.1' },
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk;
    },
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    ended: false,
    writeHead(status, headers = {}) {
      res.statusCode = status;
      res.headers = { ...res.headers, ...headers };
      return res;
    },
    setHeader(key, value) {
      res.headers[key] = value;
    },
    getHeader(key) {
      return res.headers[key];
    },
    end(data) {
      if (data) res.body += data;
      res.ended = true;
      return res;
    },
  };
  return res;
}

async function request(options) {
  const res = mockRes();
  await handler(mockReq(options), res);
  let json = null;
  try {
    json = JSON.parse(res.body);
  } catch {
    /* non-JSON response */
  }
  return { ...res, json };
}

function cookiesFrom(res) {
  const raw = res.headers['set-cookie'] || [];
  return raw.map((entry) => entry.split(';')[0]).join('; ');
}

function cookieValue(res, name) {
  const raw = res.headers['set-cookie'] || [];
  for (const entry of raw) {
    if (entry.startsWith(`${name}=`)) return entry.split(';')[0].split('=').slice(1).join('=');
  }
  return null;
}

// --------------------------------------------------------------------- tests

test('health endpoint reports configuration without leaking secrets', async () => {
  const res = await request({ url: '/api/health' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json.oauth.configured, true);
  assert.equal(res.json.database.configured, false);
  assert.deepEqual(res.json.modules, ['music', 'level', 'greet', 'ticket', 'ping', 'guard']);
  assert.ok(!res.body.includes('secret-456'));
  assert.ok(!res.body.includes('general-bot-token'));
});

test('login redirects to Discord with a state cookie', async () => {
  const res = await request({ url: '/api/auth/login' });
  assert.equal(res.statusCode, 302);
  assert.ok(res.headers.location.startsWith('https://discord.com/oauth2/authorize'));
  assert.ok(res.headers.location.includes('client_id=client-123'));
  assert.ok(res.headers.location.includes('scope=identify+guilds'));
  assert.ok(cookieValue(res, 'aurex_oauth_state'));
});

test('callback rejects a mismatched oauth state', async () => {
  const res = await request({ url: '/api/auth/callback?code=abc&state=wrong' });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json.error, 'invalid_oauth_state');
});

test('full login -> guild list -> settings -> save flow', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));

  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  assert.equal(callback.statusCode, 302);
  assert.equal(callback.headers.location, '/dashboard.html');

  const sessionCookie = cookieValue(callback, 'aurex_session');
  assert.ok(sessionCookie, 'session cookie should be set');
  assert.ok(!callback.body.includes('user-access-token'));

  const me = await request({ url: '/api/auth/me', headers: { cookie: cookiesFrom(callback) } });
  assert.equal(me.json.authenticated, true);
  assert.equal(me.json.user.id, 'user-1');
  assert.ok(me.json.csrf, 'csrf token should be exposed to the dashboard');

  const guilds = await request({ url: '/api/guilds', headers: { cookie: cookiesFrom(callback) } });
  assert.equal(guilds.statusCode, 200);
  assert.equal(guilds.json.servers.length, 1);
  assert.equal(guilds.json.servers[0].id, 'guild-1');
  assert.equal(guilds.json.total, 1);
  assert.equal(guilds.json.manageable, 1);
  assert.equal(guilds.json.scopeGranted, true);

  const settings = await request({
    url: '/api/guilds/guild-1/settings',
    headers: { cookie: cookiesFrom(callback) },
  });
  assert.equal(settings.statusCode, 200);
  assert.equal(settings.json.guild.name, 'Aurex Test Server');
  assert.equal(settings.json.channels.length, 3);
  assert.equal(settings.json.roles.length, 1, 'the @everyone role should be filtered out');
  assert.equal(settings.json.settings.music.defaultVolume, 100);

  const csrf = me.json.csrf;
  const save = await request({
    method: 'PUT',
    url: '/api/guilds/guild-1/settings',
    headers: {
      cookie: cookiesFrom(callback),
      origin: 'http://localhost:3000',
      'x-aurex-csrf': csrf,
    },
    body: { module: 'music', values: { defaultVolume: 55, stay247: true, djRoleId: 'role-dj' } },
  });

  assert.equal(save.statusCode, 200);
  assert.equal(save.json.ok, true);
  assert.equal(save.json.settings.defaultVolume, 55);
  assert.equal(save.json.settings.stay247, true);
  assert.equal(save.json.settings.djRoleId, 'role-dj');
  assert.equal(save.json.changes.length, 3, 'defaultVolume, stay247 and djRoleId all changed');

  const reread = await request({
    url: '/api/guilds/guild-1/settings',
    headers: { cookie: cookiesFrom(callback) },
  });
  assert.equal(reread.json.settings.music.defaultVolume, 55);
  assert.equal(reread.json.settings.level.defaultVolume, undefined);
});

test('saving without a csrf token is rejected', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });

  const res = await request({
    method: 'PUT',
    url: '/api/guilds/guild-1/settings',
    headers: { cookie: cookiesFrom(callback), origin: 'http://localhost:3000' },
    body: { module: 'music', values: { defaultVolume: 10 } },
  });

  assert.equal(res.statusCode, 403);
  assert.equal(res.json.error, 'csrf_failed');
});

test('saving from a foreign origin is rejected', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  const me = await request({ url: '/api/auth/me', headers: { cookie: cookiesFrom(callback) } });

  const res = await request({
    method: 'PUT',
    url: '/api/guilds/guild-1/settings',
    headers: {
      cookie: cookiesFrom(callback),
      origin: 'https://evil.example',
      'x-aurex-csrf': me.json.csrf,
    },
    body: { module: 'music', values: { defaultVolume: 10 } },
  });

  assert.equal(res.statusCode, 403);
  assert.equal(res.json.error, 'origin_rejected');
});

test('unauthenticated settings access is rejected', async () => {
  const res = await request({ url: '/api/guilds/guild-1/settings' });
  assert.equal(res.statusCode, 401);
  assert.equal(res.json.error, 'not_authenticated');
});

test('invalid values produce field level errors', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  const me = await request({ url: '/api/auth/me', headers: { cookie: cookiesFrom(callback) } });

  const res = await request({
    method: 'PUT',
    url: '/api/guilds/guild-1/settings',
    headers: {
      cookie: cookiesFrom(callback),
      origin: 'http://localhost:3000',
      'x-aurex-csrf': me.json.csrf,
    },
    body: { module: 'music', values: { defaultVolume: 9999 } },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.json.error, 'invalid_values');
  assert.ok(res.json.fields.defaultVolume);
});

test('an unknown module is rejected', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  const me = await request({ url: '/api/auth/me', headers: { cookie: cookiesFrom(callback) } });

  const res = await request({
    method: 'PUT',
    url: '/api/guilds/guild-1/settings',
    headers: {
      cookie: cookiesFrom(callback),
      origin: 'http://localhost:3000',
      'x-aurex-csrf': me.json.csrf,
    },
    body: { module: 'not-a-bot', values: {} },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.json.error, 'unknown_module');
});

test('a server with no module installed still loads its settings', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  const cookie = cookiesFrom(callback);

  const guilds = await request({ url: '/api/guilds', headers: { cookie } });
  assert.equal(guilds.statusCode, 200);
  assert.ok(Array.isArray(guilds.json.servers));
  for (const guild of guilds.json.servers) {
    assert.ok('bots' in guild, 'each server reports which modules are installed');
    // The value must be a plain object of module names, not a promise that
    // serialises to an empty object.
    assert.equal(typeof guild.bots, 'object');
    assert.ok(guild.bots === null || Object.keys(guild.bots).length > 0 || guild.bots !== undefined);
    if (guild.bots !== null) {
      assert.ok(Object.keys(guild.bots).length > 0, 'a resolved module map must not be empty');
    }
  }
});

test('the login request asks Discord for offline access', async () => {
  const res = await request({ url: '/api/auth/login' });
  const location = res.headers.location || '';
  assert.ok(location.includes('access_type=offline'), 'a refresh token is needed to renew the session');
  assert.ok(location.includes('scope=identify+guilds'), 'the server list scope must be requested');
});

test('a server owner is always able to manage their server', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  const cookie = cookiesFrom(callback);

  // Discord's permissions field for a user only reflects role derived
  // permissions, so an owner can come back without the Administrator bit.
  const guilds = await request({ url: '/api/guilds', headers: { cookie } });
  assert.equal(guilds.statusCode, 200);
  assert.equal(guilds.json.manageable, 1, 'the owner must be able to manage their server');

  const settings = await request({
    url: '/api/guilds/guild-1/settings',
    headers: { cookie },
  });
  assert.equal(settings.statusCode, 200, 'the owner must be able to open the server settings');
});

test('the settings response always reports modules, channels and roles', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));
  const callback = await request({
    url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
    headers: { cookie: cookiesFrom(login) },
  });
  const cookie = cookiesFrom(callback);

  const res = await request({
    url: '/api/guilds/guild-1/settings',
    headers: { cookie },
  });
  assert.equal(res.statusCode, 200);
  assert.ok('bots' in res.json, 'the response says which modules are installed');
  assert.ok(Array.isArray(res.json.channels), 'channels are always an array');
  assert.ok(Array.isArray(res.json.roles), 'roles are always an array');
  // A resolved module map must be a plain object with real keys, never a
  // promise that serialises to {}.
  if (res.json.bots !== null) {
    assert.ok(typeof res.json.bots === 'object');
    for (const key of Object.keys(res.json.bots)) {
      assert.ok(res.json.bots[key] === true, 'each module flag must be true');
    }
  }
});

test('server modules expose their field metadata', async () => {
  const res = await request({ url: '/api/modules' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json.guard.fields.modlogChannelId.type, 'text');
  assert.equal(res.json.guard.fields.raidAction.options.length, 3);
  assert.equal(res.json.music.fields.defaultVolume.min, 0);
});

test('a rotated Discord secret produces a readable error code', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));

  mockTokenError = 'invalid_client';
  try {
    const res = await request({
      url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
      headers: { cookie: cookiesFrom(login) },
    });
    assert.equal(res.statusCode, 302);
    assert.ok(
      res.headers.location.includes('error=oauth_invalid_client'),
      'expected a friendly error code, got ' + res.headers.location,
    );
    assert.ok(!res.headers.location.includes('invalid_client%20'), 'raw Discord text must not leak');
  } finally {
    mockTokenError = null;
  }
});

test('a redirect that Discord does not recognise is reported separately', async () => {
  const login = await request({ url: '/api/auth/login' });
  const state = decodeURIComponent(cookieValue(login, 'aurex_oauth_state'));

  mockTokenError = 'redirect_uri mismatch';
  try {
    const res = await request({
      url: `/api/auth/callback?code=auth-code&state=${encodeURIComponent(state)}`,
      headers: { cookie: cookiesFrom(login) },
    });
    assert.ok(res.headers.location.includes('error=oauth_redirect_mismatch'));
  } finally {
    mockTokenError = null;
  }
});

test('invite links are built from the application ids', async () => {
  process.env.BOT_ID_MUSIC = '111111111';
  process.env.BOT_ID_GUARD = '222222222';

  const res = await request({ url: '/api/invites' });
  assert.equal(res.statusCode, 200);
  assert.ok(res.json.music.startsWith('https://discord.com/oauth2/authorize?'));
  assert.ok(res.json.music.includes('client_id=111111111'));
  assert.ok(res.json.music.includes('scope=bot+applications.commands'));
  assert.ok(res.json.guard.includes('client_id=222222222'));
  assert.equal(res.json.greet, undefined, 'modules without an application id are skipped');
});

test('the security module is published under both "guard" and "security"', async () => {
  process.env.BOT_ID_GUARD = '222222222';

  const res = await request({ url: '/api/invites' });
  assert.ok(res.json.guard, 'the database module key must be published');
  assert.ok(res.json.security, 'the landing page addresses it as security');
  assert.equal(res.json.guard, res.json.security);
});

test('invite permissions include the high bit flags Discord uses', async () => {
  process.env.BOT_ID_GUARD = '222222222';

  const res = await request({ url: '/api/invites' });
  const permissions = Number(new URL(res.json.guard).searchParams.get('permissions'));

  const MODERATE_MEMBERS = 2 ** 40;
  const MANAGE_ROLES = 2 ** 28;
  const KICK_MEMBERS = 2 ** 1;
  const BAN_MEMBERS = 2 ** 2;

  assert.ok(permissions >= MODERATE_MEMBERS, 'moderate members must survive the bit shift');
  assert.equal((permissions & MODERATE_MEMBERS) >>> 0, MODERATE_MEMBERS >>> 0);
  assert.ok((permissions & MANAGE_ROLES) === MANAGE_ROLES);
  assert.ok((permissions & KICK_MEMBERS) === KICK_MEMBERS);
  assert.ok((permissions & BAN_MEMBERS) === BAN_MEMBERS);
});
