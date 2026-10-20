// Drives the live dashboard with a locally built session cookie so the server
// list, the module tabs and the pickers can be checked in a browser.
import { encryptSession } from '../lib/session.js';

const BASE = process.argv[2] || 'https://aurex-control.vercel.app';

async function main() {
  const session = {
    user: { id: '1234567890', username: 'probe', global_name: 'Adix', avatar: null },
    accessToken: 'probe-access-token',
    refreshToken: null,
    expiresAt: Date.now() + 3600 * 1000,
    csrf: 'probe-csrf-token',
  };

  const cookie = `aurex_session=${encodeURIComponent(encryptSession(session))}`;
  const res = await fetch(`${BASE}/api/guilds`, { headers: { cookie } });
  const body = await res.json().catch(() => ({}));

  console.log('GET /api/guilds ->', res.status);
  console.log(JSON.stringify(body, null, 1).slice(0, 700));
}

main().catch((err) => {
  console.error('crashed:', err.message);
  process.exit(1);
});
