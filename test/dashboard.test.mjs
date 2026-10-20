import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const read = (file) => fs.readFileSync(path.join(publicDir, file), 'utf8');

test('the login gate starts hidden so a signed-in user never sees it flash', () => {
  const html = read('dashboard.html');
  assert.match(html, /id="auth-gate"[^>]*hidden/, 'the auth gate must start hidden');
  assert.match(html, /id="dashboard-shell"[^>]*hidden/, 'the dashboard shell must start hidden');
  assert.match(html, /id="auth-loading"/, 'there must be a loading state while the session resolves');
});

test('the gate is only revealed once the session is known', () => {
  const js = read('dashboard.js');
  // The session check has to run before the gate is unhidden.
  const sessionCall = js.indexOf("/api/auth/me");
  const gateReveal = js.indexOf('gate.hidden = false');
  assert.ok(sessionCall > -1, 'the dashboard must ask the server about the session');
  assert.ok(gateReveal > -1, 'the gate must be revealed for signed-out visitors');
  assert.ok(
    sessionCall < gateReveal,
    'the session check must happen before the authentication gate is shown',
  );
});

test('every sign-in failure has an explanation on the gate', () => {
  const js = read('dashboard.js');
  for (const code of [
    'oauth_invalid_client',
    'oauth_redirect_mismatch',
    'oauth_code_rejected',
    'oauth_code_expired',
    'oauth_failed',
    'access_denied',
    'invalid_oauth_state',
  ]) {
    assert.ok(js.includes(code), 'missing an explanation for ' + code);
  }
});
