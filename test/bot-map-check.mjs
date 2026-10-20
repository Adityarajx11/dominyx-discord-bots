// Runs the dashboard's own bot lookup against the live configuration.
import 'dotenv/config';
import { getBotGuildMap, getInstalledModules } from '../lib/discord.js';

const TARGETS = [
  ['RAVEN MODZ', '1504876595482202113'],
  ['YamaLok', '1195482031895875797'],
  ['XERXES', '1420435283807174758'],
  ['LUCIFER', '1551856016654860338'],
  ['Alpha Nation', '1555258166864773181'],
  ['Shuayu Town', '1550942224693592094'],
  ['prince gamer', '1118499502081450044'],
];

async function main() {
  const map = await getBotGuildMap({ force: true });

  console.log('map contents:');
  for (const [key, guilds] of Object.entries(map)) {
    console.log(`  ${key.padEnd(7)} ${guilds.size} guild(s)  ${[...guilds].join(',')}`);
  }

  console.log('');
  console.log('lookup per server:');
  for (const [name, id] of TARGETS) {
    const present = getInstalledModules(id, map);
    console.log(`  ${name.padEnd(14)} ${id}  ->  ${present ? Object.keys(present).join(', ') : 'NONE'}`);
  }
}

main().catch((err) => {
  console.error('crashed:', err.message);
  process.exit(1);
});
