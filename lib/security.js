import crypto from 'node:crypto';
import { env } from './env.js';
import { query } from './db.js';
import { CSRF_HEADER } from './session.js';

const buckets = new Map();

// Sliding-window limiter, per process instance.
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);

  if (bucket.length >= limit) {
    buckets.set(key, bucket);
    const retryAfter = Math.ceil((windowMs - (now - bucket[0])) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  bucket.push(now);
  buckets.set(key, bucket);

  // Keep the map from growing without bound.
  if (buckets.size > 5000) {
    for (const [entryKey, stamps] of buckets) {
      if (stamps.length === 0 || now - stamps[stamps.length - 1] > windowMs) buckets.delete(entryKey);
    }
  }

  return { allowed: true, remaining: limit - bucket.length, retryAfter: 0 };
}

export function expectedOrigin(req) {
  if (env.publicUrl) {
    try {
      return new URL(env.publicUrl).origin;
    } catch {
      // fall through to the request-derived origin
    }
  }
  const protocol = (req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return host ? `${protocol}://${host}` : null;
}

// Blocks cross-site state-changing requests. SameSite=Lax on the session cookie
// already stops most of this; the Origin check covers the rest.
export function originAllowed(req) {
  const expected = expectedOrigin(req);
  const origin = req.headers.origin;

  if (origin) {
    if (!expected) return false;
    try {
      return new URL(origin).origin === new URL(expected).origin;
    } catch {
      return false;
    }
  }

  // No Origin header (some non-browser clients). Fall back to Fetch Metadata.
  const fetchSite = (req.headers['sec-fetch-site'] || '').toLowerCase();
  if (fetchSite === 'cross-site') return false;
  return true;
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length || left.length === 0) return false;
  return crypto.timingSafeEqual(left, right);
}

// Double-submit check against the CSRF token embedded in the encrypted session.
export function csrfValid(req, session) {
  if (!session?.csrf) return false;
  return safeEqual(req.headers[CSRF_HEADER], session.csrf);
}

export async function audit({ userId, guildId, module, action, changes = [] }) {
  try {
    await query(
      `INSERT INTO dashboard_audit_log (user_id, guild_id, module, action, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, guildId, module || null, action, JSON.stringify(changes)],
    );
  } catch (error) {
    // Auditing must never break the request path.
    console.error('[audit] failed to record entry:', error.message);
  }
}
