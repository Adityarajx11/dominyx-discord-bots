import { botIdFor } from './env.js';

// Discord permission bits used by the invite links.
const PERMISSIONS = {
  VIEW_CHANNEL: 1 << 10,
  SEND_MESSAGES: 1 << 11,
  MANAGE_MESSAGES: 1 << 13,
  EMBED_LINKS: 1 << 14,
  READ_MESSAGE_HISTORY: 1 << 16,
  MENTION_EVERYONE: 1 << 17,
  CONNECT: 1 << 20,
  SPEAK: 1 << 21,
  MOVE_MEMBERS: 1 << 24,
  USE_VAD: 1 << 25,
  MANAGE_NICKNAMES: 1 << 27,
  MANAGE_ROLES: 1 << 28,
  MANAGE_CHANNELS: 1 << 4,
  KICK_MEMBERS: 1 << 1,
  BAN_MEMBERS: 1 << 2,
  // Bit 40 overflows JavaScript's 32-bit bitwise operators, so it needs 2 ** 40.
  MODERATE_MEMBERS: 2 ** 40,
};

const MODULE_PERMISSIONS = {
  music: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.CONNECT,
    PERMISSIONS.SPEAK,
    PERMISSIONS.MOVE_MEMBERS,
    PERMISSIONS.USE_VAD,
  ],
  level: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.MANAGE_ROLES,
  ],
  greet: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_NICKNAMES,
  ],
  ping: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.MENTION_EVERYONE,
  ],
  ticket: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.MANAGE_ROLES,
  ],
  guard: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.BAN_MEMBERS,
    PERMISSIONS.MODERATE_MEMBERS,
  ],
};

// Bits are summed rather than OR-ed: JavaScript's bitwise operators are 32-bit
// and would truncate flags above bit 31, such as MODERATE_MEMBERS.
const sum = (bits) => bits.reduce((total, bit) => total + bit, 0);

// The landing page addresses the security module as "security", while the
// database and the dashboard call it "guard". Both keys are published.
const MODULE_ALIASES = { guard: 'security' };

// Builds the "Add to Discord" URLs from the server-side application IDs.
// Application IDs are public values — they appear in every invite link — so
// serving them from the API is safe, and it keeps them out of the HTML.
export function inviteLinks() {
  const links = {};
  for (const [module, bits] of Object.entries(MODULE_PERMISSIONS)) {
    const applicationId = botIdFor(module);
    if (!applicationId) continue;
    const params = new URLSearchParams({
      client_id: applicationId,
      scope: 'bot applications.commands',
      permissions: String(sum(bits)),
    });
    const url = `https://discord.com/oauth2/authorize?${params}`;
    links[module] = url;
    const alias = MODULE_ALIASES[module];
    if (alias) links[alias] = url;
  }
  return links;
}
