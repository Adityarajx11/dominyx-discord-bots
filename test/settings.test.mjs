import test from 'node:test';
import assert from 'node:assert/strict';
import { newDb } from 'pg-mem';

import { usePool, ensureSchema } from '../lib/db.js';
import { MODULES, MODULE_KEYS, schemaStatements } from '../lib/schema.js';
import { readAllModules, readModule, writeModule, diffFields, coerce } from '../lib/settings.js';

const GUILD = '1234567890';

async function withDatabase(run) {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  db.public.registerFunction({
    name: 'now',
    returns: 'timestamptz',
    implementation: () => new Date(),
  });
  db.public.none(`CREATE SCHEMA IF NOT EXISTS public`);
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();
  usePool(pool);
  await ensureSchema();
  await run();
  await pool.end();
}

test('schema statements cover every module table and the audit log', () => {
  const statements = schemaStatements().join('\n');
  for (const module of Object.values(MODULES)) {
    assert.ok(statements.includes(`CREATE TABLE IF NOT EXISTS ${module.table}`), module.table);
  }
  assert.ok(statements.includes('dashboard_audit_log'));
});

test('no module exposes an on/off toggle', () => {
  for (const key of MODULE_KEYS) {
    assert.equal(MODULES[key].fields.enabled, undefined, key + ' must not have an enabled field');
  }
});

// The bots read the same tables. This pins the contract on the dashboard side
// so it cannot drift away from packages/core/lib/settings.js in the bot repo.
test('the dashboard and the bots agree on the table names', () => {
  assert.deepEqual(
    Object.fromEntries(Object.values(MODULES).map((module) => [module.key, module.table])),
    {
      music: 'music_settings',
      level: 'level_config',
      greet: 'greet_settings',
      ticket: 'ticket_config',
      ping: 'ping_settings',
      guard: 'guard_settings',
    },
  );
});

test('reads return defaults before anything is written', async () => {
  await withDatabase(async () => {
    const music = await readModule(GUILD, 'music');
    assert.equal(music.defaultVolume, 100);
    assert.equal(music.stay247, false);
    assert.equal(music.prefix, '!');
    assert.equal(music.djRoleId, null);
  });
});

test('writes persist and read back', async () => {
  await withDatabase(async () => {
    const saved = await writeModule(GUILD, 'music', {
      defaultVolume: 65,
      stay247: true,
      djRoleId: 'role-1',
      prefix: '?',
    });
    assert.equal(saved.defaultVolume, 65);
    assert.equal(saved.stay247, true);
    assert.equal(saved.djRoleId, 'role-1');
    assert.equal(saved.prefix, '?');

    const reread = await readModule(GUILD, 'music');
    assert.equal(reread.defaultVolume, 65);
    assert.equal(reread.stay247, true);
  });
});

test('partial writes leave untouched columns alone', async () => {
  await withDatabase(async () => {
    await writeModule(GUILD, 'music', { defaultVolume: 42, prefix: '$' });
    await writeModule(GUILD, 'music', { maxQueue: 10 });
    const music = await readModule(GUILD, 'music');
    assert.equal(music.defaultVolume, 42);
    assert.equal(music.prefix, '$');
    assert.equal(music.maxQueue, 10);
  });
});

test('modules are isolated from each other', async () => {
  await withDatabase(async () => {
    await writeModule(GUILD, 'guard', { modlogChannelId: 'chan-9', warnsMute: 7 });
    const guard = await readModule(GUILD, 'guard');
    const music = await readModule(GUILD, 'music');
    assert.equal(guard.modlogChannelId, 'chan-9');
    assert.equal(guard.warnsMute, 7);
    assert.equal(music.modlogChannelId, undefined);
    assert.equal(music.warnsMute, undefined);
  });
});

test('all six modules can be read together', async () => {
  await withDatabase(async () => {
    const all = await readAllModules(GUILD);
    assert.deepEqual(Object.keys(all).sort(), [...MODULE_KEYS].sort());
  });
});

test('out-of-range numbers are rejected', async () => {
  await withDatabase(async () => {
    await assert.rejects(
      () => writeModule(GUILD, 'music', { defaultVolume: 500 }),
      (error) => {
        assert.ok(error.fields.defaultVolume);
        return true;
      },
    );
  });
});

test('enums only accept known options', async () => {
  await withDatabase(async () => {
    await assert.rejects(() => writeModule(GUILD, 'guard', { raidAction: 'nuke' }));
    await writeModule(GUILD, 'guard', { raidAction: 'timeout' });
    const guard = await readModule(GUILD, 'guard');
    assert.equal(guard.raidAction, 'timeout');
  });
});

test('unknown fields are ignored rather than written', async () => {
  await withDatabase(async () => {
    const saved = await writeModule(GUILD, 'music', { defaultVolume: 55, dropTable: 'music_settings' });
    assert.equal(saved.defaultVolume, 55);
    assert.equal(saved.dropTable, undefined);
  });
});

test('json list fields round-trip', async () => {
  await withDatabase(async () => {
    await writeModule(GUILD, 'guard', { badWords: ['spam', 'scam'] });
    const guard = await readModule(GUILD, 'guard');
    assert.deepEqual(guard.badWords, ['spam', 'scam']);
  });
});

test('newline strings are accepted for list fields', async () => {
  await withDatabase(async () => {
    await writeModule(GUILD, 'level', { ignoredChannels: '111\n222\n\n333' });
    const level = await readModule(GUILD, 'level');
    assert.deepEqual(level.ignoredChannels, ['111', '222', '333']);
  });
});

test('diffFields reports only what changed', () => {
  const before = { defaultVolume: 100, prefix: '!' };
  const after = { defaultVolume: 80, prefix: '!' };
  const changes = diffFields(before, after);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].field, 'defaultVolume');
  assert.equal(changes[0].from, 100);
  assert.equal(changes[0].to, 80);
});

test('coerce handles the field types used by the schema', () => {
  assert.deepEqual(coerce({ type: 'boolean' }, 'enabled'), { ok: true, value: true });
  assert.deepEqual(coerce({ type: 'boolean' }, 'disabled'), { ok: true, value: false });
  assert.equal(coerce({ type: 'integer', min: 1, max: 10 }, 11).ok, false);
  assert.equal(coerce({ type: 'integer', min: 1, max: 10 }, 5).value, 5);
  assert.equal(coerce({ type: 'text', maxLength: 3 }, 'abcd').ok, false);
  assert.deepEqual(coerce({ type: 'text-list' }, 'a\nb'), { ok: true, value: ['a', 'b'] });
});
