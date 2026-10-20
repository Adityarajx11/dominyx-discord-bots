// Compares how the live server answers the api routes with and without a cookie.
import { encryptSession } from '../lib/session.js';

const BASE = process.argv[2] || 'https://aurex-control.vercel.app';

async function probe(label, path, cookie) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${BASE}${path}`, { headers });
  const body = await res.text();
  console.log(`  ${label.padEnd(34)} HTTP ${res.status}  ${res.headers.get('content-type') || ''}  ${body.slice(0, 90)}`);
}

async function main() {
  const session = {
    user: { id: '1234567890', username: 'probe', global_name: 'Probe' },
    accessToken: 'probe-access-token',
    refreshToken: null,
    expiresAt: Date.now() + 3600 * 1000,
    csrf: 'probe-csrf-token',
  };
  const cookie = `aurex_session=${encodeURIComponent(encryptSession(session))}`;

  console.log('no cookie:');
  await probe('GET /api/health', '/api/health');
  await probe('GET /api/auth/me', '/api/auth/me');
  await probe('GET /api/modules', '/api/modules');
  await probe('GET /api/guilds', '/api/guilds');

  console.log('');
  console.log('with a session cookie:');
  await probe('GET /api/health', '/api/health', cookie);
  await probe('GET /api/auth/me', '/api/auth/me', cookie);
  await probe('GET /api/modules', '/api/modules', cookie);
}

main().catch((err) => {
  console.error('crashed:', err.message);
  process.exit(1);
});
