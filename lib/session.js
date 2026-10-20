import crypto from 'node:crypto';
import { env } from './env.js';

export const SESSION_COOKIE = 'dominyx_session';
export const STATE_COOKIE = 'dominyx_oauth_state';
export const SESSION_TTL = 60 * 60 * 8; // 8 hours
export const CSRF_HEADER = 'x-dominyx-csrf';

const keyFromSecret = () =>
  crypto.createHash('sha256').update(env.sessionSecret || 'development-only-secret').digest();

export function encryptSession(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFromSecret(), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL * 1000 }), 'utf8'),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), body].map((part) => part.toString('base64url')).join('.');
}

export function decryptSession(value) {
  try {
    const [ivText, tagText, bodyText] = value.split('.');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyFromSecret(), Buffer.from(ivText, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
    const body = Buffer.concat([decipher.update(Buffer.from(bodyText, 'base64url')), decipher.final()]);
    const data = JSON.parse(body.toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function createCsrfToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function safeUser(user) {
  return {
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
    discriminator: user.discriminator,
  };
}

export function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf('=');
        return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim())];
      }),
  );
}

export function sessionFor(req) {
  const value = parseCookies(req)[SESSION_COOKIE];
  return value ? decryptSession(value) : null;
}
