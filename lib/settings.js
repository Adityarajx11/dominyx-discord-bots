import { MODULES } from './schema.js';
import { query, queryOne, ensureSchema } from './db.js';

const TRUE_VALUES = new Set(['true', 'on', '1', 'yes', 'enabled']);
const FALSE_VALUES = new Set(['false', 'off', '0', 'no', 'disabled']);

export function coerce(field, value) {
  switch (field.type) {
    case 'boolean': {
      if (typeof value === 'boolean') return { ok: true, value };
      const normalised = String(value ?? '').trim().toLowerCase();
      if (TRUE_VALUES.has(normalised)) return { ok: true, value: true };
      if (FALSE_VALUES.has(normalised)) return { ok: true, value: false };
      return { ok: false, error: 'expected a boolean' };
    }

    case 'integer': {
      if (value === null || value === undefined || String(value).trim() === '') {
        return { ok: true, value: field.default ?? null };
      }
      const numeric = typeof value === 'number' ? value : Number(String(value).trim());
      if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
        return { ok: false, error: 'expected a whole number' };
      }
      if (field.min !== undefined && numeric < field.min) {
        return { ok: false, error: `must be at least ${field.min}` };
      }
      if (field.max !== undefined && numeric > field.max) {
        return { ok: false, error: `must be at most ${field.max}` };
      }
      return { ok: true, value: numeric };
    }

    case 'enum': {
      const text = String(value ?? '').trim();
      if (!field.options.includes(text)) {
        return { ok: false, error: `must be one of: ${field.options.join(', ')}` };
      }
      return { ok: true, value: text };
    }

    case 'text-list': {
      const items = Array.isArray(value)
        ? value
        : String(value ?? '')
            .split('\n')
            .map((item) => item.trim());
      const cleaned = [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
      return { ok: true, value: cleaned };
    }

    case 'json-object': {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return { ok: true, value };
      }
      return { ok: false, error: 'expected an object' };
    }

    default: {
      if (value === null || value === undefined) return { ok: true, value: null };
      const text = String(value);
      if (field.maxLength && text.length > field.maxLength) {
        return { ok: false, error: `must be ${field.maxLength} characters or fewer` };
      }
      return { ok: true, value: text.trim() === '' ? null : text };
    }
  }
}

// Serialises a value for a Postgres parameter, matching the column type.
function toColumnValue(field, value) {
  if (field.type === 'text-list' || field.type === 'json-object') return JSON.stringify(value);
  if (field.type === 'boolean') return value;
  if (field.type === 'integer') return value;
  return value;
}

function fromColumnValue(field, value) {
  if (value === null || value === undefined) return field.default ?? null;
  if (field.type === 'text-list' || field.type === 'json-object') {
    return typeof value === 'string' ? JSON.parse(value) : value;
  }
  return value;
}

export function defaultsFor(moduleKey) {
  const module = MODULES[moduleKey];
  const result = {};
  for (const [name, field] of Object.entries(module.fields)) {
    result[name] = field.default ?? null;
  }
  return result;
}

export async function readModule(guildId, moduleKey) {
  const module = MODULES[moduleKey];
  if (!module) throw new Error(`Unknown module: ${moduleKey}`);

  await ensureSchema();
  const row = await queryOne(`SELECT * FROM ${module.table} WHERE guild_id = $1`, [guildId]);

  const result = defaultsFor(moduleKey);
  if (row) {
    for (const [name, field] of Object.entries(module.fields)) {
      result[name] = fromColumnValue(field, row[field.column]);
    }
  }
  return result;
}

export async function readAllModules(guildId) {
  const entries = await Promise.all(
    Object.keys(MODULES).map(async (key) => [key, await readModule(guildId, key)]),
  );
  return Object.fromEntries(entries);
}

// Validates and upserts only the supplied fields. Unlisted columns keep their
// current value, so the dashboard never clobbers settings it does not own.
export async function writeModule(guildId, moduleKey, values) {
  const module = MODULES[moduleKey];
  if (!module) throw new Error(`Unknown module: ${moduleKey}`);

  const mapped = {};
  const errors = {};

  for (const [name, raw] of Object.entries(values || {})) {
    const field = module.fields[name];
    if (!field) continue; // silently ignore unknown keys
    const result = coerce(field, raw);
    if (!result.ok) {
      errors[name] = result.error;
      continue;
    }
    mapped[field.column] = { field, value: result.value };
  }

  if (Object.keys(errors).length) {
    const error = new Error('Some settings are invalid');
    error.fields = errors;
    throw error;
  }

  const keys = Object.keys(mapped);
  if (!keys.length) return readModule(guildId, moduleKey);

  await ensureSchema();

  const columns = ['guild_id', ...keys, 'updated_at'];
  const values$ = [guildId, ...keys.map((key) => toColumnValue(mapped[key].field, mapped[key].value)), new Date()];
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const assignments = [...keys.map((key) => `${key} = EXCLUDED.${key}`), 'updated_at = EXCLUDED.updated_at'];

  await query(
    `INSERT INTO ${module.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})
     ON CONFLICT (guild_id) DO UPDATE SET ${assignments.join(', ')}`,
    values$,
  );

  return readModule(guildId, moduleKey);
}

// Only the fields that actually changed, for the audit trail.
export function diffFields(before, after) {
  const changes = [];
  for (const [name, value] of Object.entries(after || {})) {
    const previous = before?.[name];
    if (JSON.stringify(previous) !== JSON.stringify(value)) {
      changes.push({ field: name, from: previous ?? null, to: value ?? null });
    }
  }
  return changes;
}
