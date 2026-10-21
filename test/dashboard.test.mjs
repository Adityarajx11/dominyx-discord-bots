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
  const sessionCall = js.indexOf('/api/auth/me');
  const reveal = js.indexOf("reveal('gate')");
  assert.ok(sessionCall > -1, 'the dashboard must ask the server about the session');
  assert.ok(reveal > -1, 'the gate must be revealed for signed-out visitors');
  assert.ok(
    sessionCall < reveal,
    'the session check must happen before the authentication gate is shown',
  );
  assert.ok(js.includes("reveal('shell')"), 'a signed-in visitor must get the dashboard');
});

test('the main page sends visitors to the authentication page, not straight to Discord', () => {
  const html = read('index.html');
  const ctas = [...html.matchAll(/<a[^>]*data-auth-cta[^>]*>/g)].map((m) => m[0]);
  assert.ok(ctas.length >= 3, 'the landing page should have several entry points');
  for (const cta of ctas) {
    assert.match(cta, /href="\/dashboard\.html"/, 'each entry point must go to the authentication page');
    assert.ok(!cta.includes('/api/auth/login'), 'the landing page must not skip the authentication page');
  }

  // The authentication page itself keeps the button that starts the Discord flow.
  const dashboard = read('dashboard.html');
  assert.match(dashboard, /href="\/api\/auth\/login"/, 'the authentication page needs the Discord button');
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
