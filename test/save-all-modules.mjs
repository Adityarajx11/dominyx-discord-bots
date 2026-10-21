// Saves to every module table against the live database and reads it back.
// This is what the dashboard does when a setting is saved.
import 'dotenv/config';
import { writeModule, readModule } from '../lib/settings.js';
import { MODULE_KEYS } from '../lib/schema.js';

const GUILD = process.argv[2] || '1504876595482202113';

async function main() {
  for (const module of MODULE_KEYS) {
    const before = await readModule(GUILD, module);
    const originalEnabled = before.enabled;

    try {
      const saved = await writeModule(GUILD, module, { enabled: false });
      const reread = await readModule(GUILD, module);
      const ok = saved.enabled === false && reread.enabled === false;
      console.log(`  ${module.padEnd(7)} ${ok ? 'OK  ' : 'FAIL'} enabled -> false, read back ${reread.enabled}`);
      await writeModule(GUILD, module, { enabled: originalEnabled });
    } catch (err) {
      console.log(`  ${module.padEnd(7)} FAIL ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error('crashed:', err.message);
  process.exit(1);
});
