// Checks that the dashboard's Enabled toggle really reaches the database.
// Writes, reads back, then restores the original value.
import 'dotenv/config';
import { writeModule, readModule } from '../lib/settings.js';

const GUILD = process.argv[2] || '1504876595482202113';
const MODULE = process.argv[3] || 'music';

async function main() {
  const before = await readModule(GUILD, MODULE);
  console.log('before  : enabled =', before.enabled);

  const saved = await writeModule(GUILD, MODULE, { enabled: false });
  console.log('after write(false): enabled =', saved.enabled);

  const reread = await readModule(GUILD, MODULE);
  console.log('reread from db    : enabled =', reread.enabled);

  const restored = await writeModule(GUILD, MODULE, { enabled: before.enabled });
  console.log('restored           : enabled =', restored.enabled);

  console.log('');
  console.log(reread.enabled === false ? 'PASS: the toggle reaches the database' : 'FAIL: the value did not persist');
}

main().catch((err) => {
  console.error('crashed:', err.message);
  process.exit(1);
});
