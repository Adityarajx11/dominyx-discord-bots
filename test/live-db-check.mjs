// Exercises the dashboard's own database and settings code against the live
// database, exactly as the server does.
import { getPool, ensureSchema } from '../lib/db.js';
import { readAllModules, writeModule } from '../lib/settings.js';
import { MODULE_KEYS, MODULES } from '../lib/schema.js';

const guildId = process.argv[2] || '0';

async function main() {
  console.log('--- ensureSchema ---');
  await ensureSchema();
  console.log('  schema is up to date');

  console.log('');
  console.log('--- columns per module table ---');
  const pool = getPool();
  for (const key of MODULE_KEYS) {
    const table = MODULES[key].table;
    const columns = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY column_name`,
      [table],
    );
    const names = columns.rows.map((c) => c.column_name);
    const expected = Object.values(MODULES[key].fields).map((f) => f.column);
    const missing = expected.filter((c) => !names.includes(c));
    console.log(
      `  ${table.padEnd(22)} ${String(names.length).padStart(2)} columns` +
        (missing.length ? `  MISSING: ${missing.join(', ')}` : '  complete'),
    );
  }

  console.log('');
  console.log('--- read all modules (defaults for a fresh guild) ---');
  const settings = await readAllModules(guildId);
  for (const key of MODULE_KEYS) {
    const s = settings[key];
    console.log(`  ${key.padEnd(7)} enabled=${s.enabled}  fields=${Object.keys(s).length}`);
  }

  console.log('');
  console.log('--- write + read back (music) ---');
  const before = await writeModule(guildId, 'music', { defaultVolume: 77, stay247: true, prefix: '!' });
  console.log('  saved  :', JSON.stringify({ defaultVolume: before.defaultVolume, stay247: before.stay247, prefix: before.prefix }));
  const after = await readAllModules(guildId);
  console.log('  reread :', JSON.stringify({ defaultVolume: after.music.defaultVolume, stay247: after.music.stay247 }));
  console.log('  others untouched:', JSON.stringify({ level: after.level.xpMin, guard: after.guard.warnsBan }));

  await pool.end();
}

main().catch((err) => {
  console.error('crashed:', err.message);
  process.exit(1);
});
